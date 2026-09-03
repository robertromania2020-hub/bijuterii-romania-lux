ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS refunded_amount numeric(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stripe_refund_id text;

UPDATE public.orders SET payment_status = 'paid' WHERE payment_status IN ('platita','paid');
UPDATE public.orders SET payment_status = 'pending' WHERE payment_status NOT IN ('paid','failed','refunded','cancelled');
ALTER TABLE public.orders ALTER COLUMN payment_status SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_idx
  ON public.orders (stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  order_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.stripe_events TO service_role;
ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stripe events admin read" ON public.stripe_events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
GRANT SELECT ON public.stripe_events TO authenticated;

CREATE OR REPLACE FUNCTION public.place_order(p_items jsonb, p_customer jsonb, p_shipping jsonb, p_payment_method text DEFAULT 'ramburs'::text, p_customer_notes text DEFAULT NULL::text, p_coupon_code text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_order_id text;
  v_number text;
  v_item jsonb;
  v_pid text;
  v_vid text;
  v_qty integer;
  v_prod public.products%ROWTYPE;
  v_var public.product_variants%ROWTYPE;
  v_unit numeric(10,2);
  v_disc_unit numeric(10,2);
  v_dtype text;
  v_dvalue numeric;
  v_line_total numeric(10,2);
  v_subtotal numeric(10,2) := 0;
  v_discount numeric(10,2) := 0;
  v_shipping numeric(10,2) := 0;
  v_total numeric(10,2);
  v_stock integer;
  v_image text;
  v_name text;
  v_city text := COALESCE(p_shipping->>'city', '');
  v_county text := COALESCE(p_shipping->>'county', '');
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Trebuie să fii autentificat pentru a plasa o comandă.' USING HINT = 'APP';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Coșul tău este gol.' USING HINT = 'APP';
  END IF;
  IF COALESCE(p_payment_method, '') NOT IN ('ramburs', 'card') THEN
    RAISE EXCEPTION 'Metodă de plată indisponibilă.' USING HINT = 'APP';
  END IF;
  IF COALESCE(p_customer->>'email', '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Datele introduse nu sunt valide.' USING HINT = 'APP';
  END IF;
  IF length(COALESCE(p_customer->>'first_name', '')) < 2
     OR length(COALESCE(p_customer->>'last_name', '')) < 2
     OR length(COALESCE(p_customer->>'phone', '')) < 10
     OR v_city = '' OR v_county = ''
     OR length(COALESCE(p_shipping->>'address', '')) < 3 THEN
    RAISE EXCEPTION 'Datele introduse nu sunt valide.' USING HINT = 'APP';
  END IF;

  v_number := 'CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  v_order_id := gen_random_uuid()::text;

  INSERT INTO public.orders (
    id, number, user_id, customer_name, customer_email, customer_phone,
    city, county, subtotal, discount, shipping, total, status,
    payment_method, payment_status, coupon_code, customer_notes,
    shipping_address, items
  ) VALUES (
    v_order_id, v_number, v_user,
    trim(COALESCE(p_customer->>'last_name', '') || ' ' || COALESCE(p_customer->>'first_name', '')),
    p_customer->>'email', COALESCE(p_customer->>'phone', ''),
    v_city, v_county, 0, 0, 0, 0, 'noua',
    p_payment_method, 'pending', p_coupon_code, p_customer_notes,
    p_shipping, '[]'::jsonb
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_pid := v_item->>'product_id';
    v_vid := NULLIF(v_item->>'variant_id', '');
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));

    SELECT * INTO v_prod FROM public.products WHERE id = v_pid FOR UPDATE;
    IF NOT FOUND OR v_prod.status <> 'activ' THEN
      RAISE EXCEPTION 'Produsul nu mai este disponibil.' USING HINT = 'APP';
    END IF;

    v_name := v_prod.name;
    v_unit := v_prod.price;
    SELECT url INTO v_image FROM public.product_images
      WHERE product_id = v_prod.id ORDER BY position LIMIT 1;

    IF v_vid IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants
        WHERE id = v_vid AND product_id = v_pid FOR UPDATE;
      IF NOT FOUND OR NOT v_var.active THEN
        RAISE EXCEPTION 'Varianta selectată nu mai este disponibilă.' USING HINT = 'APP';
      END IF;
      v_unit := COALESCE(v_var.price, v_prod.price);
      v_stock := v_var.stock;
      IF v_var.image IS NOT NULL THEN v_image := v_var.image; END IF;
    ELSE
      v_stock := v_prod.stock;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Ne pare rău, produsul nu mai este disponibil în cantitatea solicitată.' USING HINT = 'APP';
    END IF;

    v_disc_unit := 0;
    SELECT d.type, d.value INTO v_dtype, v_dvalue
      FROM public.discounts d
     WHERE d.active
       AND CURRENT_DATE BETWEEN d.starts_at AND d.ends_at
       AND (
         (d.target_type = 'produs' AND d.target_slug = v_prod.slug)
         OR (d.target_type = 'categorie' AND d.target_slug = v_prod.category_slug)
         OR (d.target_type = 'departament' AND d.target_slug = v_prod.department_slug)
         OR (d.target_type = 'colectie' AND d.target_slug = v_prod.collection_slug)
       )
     ORDER BY (CASE WHEN d.type = 'procent' THEN v_unit * d.value / 100 ELSE d.value END) DESC
     LIMIT 1;
    IF v_dtype IS NOT NULL THEN
      v_disc_unit := LEAST(v_unit, ROUND(CASE WHEN v_dtype = 'procent' THEN v_unit * v_dvalue / 100 ELSE v_dvalue END, 2));
    END IF;
    v_dtype := NULL;

    v_line_total := ROUND((v_unit - v_disc_unit) * v_qty, 2);
    v_subtotal := v_subtotal + ROUND(v_unit * v_qty, 2);
    v_discount := v_discount + ROUND(v_disc_unit * v_qty, 2);

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, product_name_snapshot, sku_snapshot,
      variant_name_snapshot, product_image_snapshot, department_slug,
      unit_price, quantity, discount_amount, total
    ) VALUES (
      v_order_id, v_prod.id, v_vid, v_name,
      COALESCE(CASE WHEN v_vid IS NULL THEN v_prod.sku ELSE v_var.sku END, v_prod.sku),
      CASE WHEN v_vid IS NULL THEN NULL ELSE v_var.label END,
      v_image, v_prod.department_slug,
      v_unit, v_qty, ROUND(v_disc_unit * v_qty, 2), v_line_total
    );

    IF v_vid IS NOT NULL THEN
      UPDATE public.product_variants SET stock = stock - v_qty WHERE id = v_vid;
    ELSE
      UPDATE public.products SET stock = stock - v_qty WHERE id = v_pid;
    END IF;

    INSERT INTO public.inventory_history (
      product_id, variant_id, previous_quantity, quantity_change, new_quantity,
      reason, reference_type, reference_id, changed_by
    ) VALUES (
      v_pid, v_vid, v_stock, -v_qty, v_stock - v_qty,
      'Vânzare', 'comanda', v_order_id, v_user
    );
  END LOOP;

  v_shipping := CASE WHEN (v_subtotal - v_discount) >= 250 THEN 0 ELSE 19.99 END;
  v_total := ROUND(v_subtotal - v_discount + v_shipping, 2);

  UPDATE public.orders
     SET subtotal = v_subtotal, discount = v_discount, shipping = v_shipping, total = v_total,
         items = COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'productId', oi.product_id, 'name', oi.product_name_snapshot,
             'sku', oi.sku_snapshot, 'departmentSlug', oi.department_slug,
             'variantLabel', oi.variant_name_snapshot,
             'quantity', oi.quantity, 'price', oi.unit_price))
           FROM public.order_items oi WHERE oi.order_id = v_order_id), '[]'::jsonb)
   WHERE id = v_order_id;

  INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, note)
  VALUES (v_order_id, NULL, 'noua', v_user, 'Comandă plasată de client');

  RETURN jsonb_build_object('order_id', v_order_id, 'number', v_number, 'total', v_total);
END;
$function$;

CREATE OR REPLACE FUNCTION public.apply_stripe_payment_event(
  p_event_id text,
  p_event_type text,
  p_order_id text,
  p_outcome text,
  p_session_id text DEFAULT NULL,
  p_payment_intent_id text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_order public.orders%ROWTYPE;
  v_it record;
  v_prev integer;
BEGIN
  IF p_outcome NOT IN ('paid','failed','cancelled') THEN
    RAISE EXCEPTION 'Rezultat de plată invalid.' USING HINT = 'APP';
  END IF;

  BEGIN
    INSERT INTO public.stripe_events (id, type, order_id) VALUES (p_event_id, p_event_type, p_order_id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('status', 'duplicate');
  END;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'order_not_found');
  END IF;

  IF v_order.payment_status = 'paid' AND p_outcome <> 'paid' THEN
    RETURN jsonb_build_object('status', 'already_paid');
  END IF;

  IF p_outcome = 'paid' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('status', 'already_paid');
    END IF;
    UPDATE public.orders
       SET payment_status = 'paid',
           paid_at = now(),
           status = CASE WHEN status = 'noua' THEN 'confirmata' ELSE status END,
           stripe_checkout_session_id = COALESCE(p_session_id, stripe_checkout_session_id),
           stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id)
     WHERE id = p_order_id;

    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, note)
    VALUES (p_order_id, v_order.status, 'confirmata', NULL, 'Plată confirmată de Stripe');
    RETURN jsonb_build_object('status', 'paid');
  END IF;

  -- failed / cancelled: nu se dublează restituirea stocului
  IF v_order.payment_status IN ('failed','cancelled') THEN
    RETURN jsonb_build_object('status', 'already_closed');
  END IF;

  UPDATE public.orders
     SET payment_status = p_outcome,
         stripe_checkout_session_id = COALESCE(p_session_id, stripe_checkout_session_id),
         stripe_payment_intent_id = COALESCE(p_payment_intent_id, stripe_payment_intent_id),
         status = CASE WHEN status IN ('noua','confirmata') THEN 'anulata' ELSE status END
   WHERE id = p_order_id;

  IF v_order.status NOT IN ('anulata','returnata') THEN
    FOR v_it IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
      v_prev := NULL;
      IF v_it.variant_id IS NOT NULL THEN
        SELECT stock INTO v_prev FROM public.product_variants WHERE id = v_it.variant_id FOR UPDATE;
        IF FOUND THEN
          UPDATE public.product_variants SET stock = stock + v_it.quantity WHERE id = v_it.variant_id;
        END IF;
      ELSE
        SELECT stock INTO v_prev FROM public.products WHERE id = v_it.product_id FOR UPDATE;
        IF FOUND THEN
          UPDATE public.products SET stock = stock + v_it.quantity WHERE id = v_it.product_id;
        END IF;
      END IF;
      IF v_prev IS NOT NULL THEN
        INSERT INTO public.inventory_history (
          product_id, variant_id, previous_quantity, quantity_change, new_quantity,
          reason, reference_type, reference_id, changed_by
        ) VALUES (
          v_it.product_id, v_it.variant_id, v_prev, v_it.quantity, v_prev + v_it.quantity,
          'Plată nefinalizată', 'comanda', p_order_id, NULL
        );
      END IF;
    END LOOP;

    INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, note)
    VALUES (p_order_id, v_order.status, 'anulata', NULL,
            CASE WHEN p_outcome = 'failed' THEN 'Plata a eșuat' ELSE 'Plata a fost anulată' END);
  END IF;

  RETURN jsonb_build_object('status', p_outcome);
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_stripe_payment_event(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_stripe_payment_event(text, text, text, text, text, text) TO service_role;