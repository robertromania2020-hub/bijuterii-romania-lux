ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_source text NOT NULL DEFAULT 'online';

CREATE OR REPLACE FUNCTION public.set_order_status(p_order_id text, p_status text, p_note text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_old text;
  v_it record;
  v_prev integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Nu ai permisiunea de a modifica comenzile.' USING HINT = 'APP';
  END IF;
  IF p_status NOT IN ('whatsapp_asteptare','noua','confirmata','in_procesare','expediata','livrata','anulata','returnata') THEN
    RAISE EXCEPTION 'Status invalid.' USING HINT = 'APP';
  END IF;

  SELECT status INTO v_old FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Comanda nu a fost găsită.' USING HINT = 'APP'; END IF;
  IF v_old = p_status THEN RETURN; END IF;

  UPDATE public.orders SET status = p_status WHERE id = p_order_id;

  IF p_status IN ('anulata','returnata') AND v_old NOT IN ('anulata','returnata') THEN
    FOR v_it IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
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
          CASE WHEN p_status = 'anulata' THEN 'Anulare comandă' ELSE 'Retur' END,
          'comanda', p_order_id, auth.uid()
        );
      END IF;
      v_prev := NULL;
    END LOOP;
  END IF;

  INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, note)
  VALUES (p_order_id, v_old, p_status, auth.uid(), p_note);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_manual_order(
  p_items jsonb,
  p_customer jsonb,
  p_shipping jsonb,
  p_payment_method text DEFAULT 'ramburs',
  p_shipping_cost numeric DEFAULT 25,
  p_admin_notes text DEFAULT NULL,
  p_source text DEFAULT 'whatsapp'
)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_admin uuid := auth.uid();
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
  v_shipping numeric(10,2) := GREATEST(0, COALESCE(p_shipping_cost, 25));
  v_total numeric(10,2);
  v_stock integer;
  v_image text;
  v_city text := COALESCE(p_shipping->>'city', '');
  v_county text := COALESCE(p_shipping->>'county', '');
BEGIN
  IF NOT public.has_role(v_admin, 'admin') THEN
    RAISE EXCEPTION 'Nu ai permisiunea de a crea comenzi.' USING HINT = 'APP';
  END IF;
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Adaugă cel puțin un produs în comandă.' USING HINT = 'APP';
  END IF;
  IF COALESCE(p_payment_method, '') NOT IN ('ramburs', 'card', 'transfer') THEN
    RAISE EXCEPTION 'Metodă de plată indisponibilă.' USING HINT = 'APP';
  END IF;
  IF COALESCE(p_source, '') NOT IN ('whatsapp', 'telefon', 'online') THEN
    RAISE EXCEPTION 'Sursă comandă invalidă.' USING HINT = 'APP';
  END IF;
  IF length(COALESCE(p_customer->>'name', '')) < 3
     OR length(COALESCE(p_customer->>'phone', '')) < 10 THEN
    RAISE EXCEPTION 'Numele și telefonul clientului sunt obligatorii.' USING HINT = 'APP';
  END IF;

  v_number := 'CMD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
  v_order_id := gen_random_uuid()::text;

  INSERT INTO public.orders (
    id, number, user_id, customer_name, customer_email, customer_phone,
    city, county, subtotal, discount, shipping, total, status,
    payment_method, payment_status, admin_notes, shipping_address, items, order_source
  ) VALUES (
    v_order_id, v_number, NULL,
    p_customer->>'name', COALESCE(p_customer->>'email', ''), p_customer->>'phone',
    v_city, v_county, 0, 0, v_shipping, 0,
    CASE WHEN p_source = 'online' THEN 'noua' ELSE 'whatsapp_asteptare' END,
    p_payment_method, 'pending', p_admin_notes, COALESCE(p_shipping, '{}'::jsonb), '[]'::jsonb, p_source
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_pid := v_item->>'product_id';
    v_vid := NULLIF(v_item->>'variant_id', '');
    v_qty := GREATEST(1, COALESCE((v_item->>'quantity')::int, 1));

    SELECT * INTO v_prod FROM public.products WHERE id = v_pid FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produsul selectat nu există.' USING HINT = 'APP';
    END IF;

    v_unit := v_prod.price;
    SELECT url INTO v_image FROM public.product_images
      WHERE product_id = v_prod.id ORDER BY position LIMIT 1;

    IF v_vid IS NOT NULL THEN
      SELECT * INTO v_var FROM public.product_variants
        WHERE id = v_vid AND product_id = v_pid FOR UPDATE;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Varianta selectată nu există.' USING HINT = 'APP';
      END IF;
      v_unit := COALESCE(v_var.price, v_prod.price);
      v_stock := v_var.stock;
      IF v_var.image IS NOT NULL THEN v_image := v_var.image; END IF;
    ELSE
      v_stock := v_prod.stock;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Stoc insuficient pentru produsul %.', v_prod.name USING HINT = 'APP';
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
      v_order_id, v_prod.id, v_vid, v_prod.name,
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
      'Comandă manuală', 'comanda', v_order_id, v_admin
    );
  END LOOP;

  v_total := ROUND(v_subtotal - v_discount + v_shipping, 2);

  UPDATE public.orders
     SET subtotal = v_subtotal, discount = v_discount, total = v_total,
         items = COALESCE((
           SELECT jsonb_agg(jsonb_build_object(
             'productId', oi.product_id, 'name', oi.product_name_snapshot,
             'sku', oi.sku_snapshot, 'departmentSlug', oi.department_slug,
             'variantLabel', oi.variant_name_snapshot,
             'quantity', oi.quantity, 'price', oi.unit_price))
           FROM public.order_items oi WHERE oi.order_id = v_order_id), '[]'::jsonb)
   WHERE id = v_order_id;

  INSERT INTO public.order_status_history (order_id, old_status, new_status, changed_by, note)
  VALUES (v_order_id, NULL,
    CASE WHEN p_source = 'online' THEN 'noua' ELSE 'whatsapp_asteptare' END,
    v_admin, 'Comandă înregistrată manual de administrator');

  RETURN jsonb_build_object('order_id', v_order_id, 'number', v_number, 'total', v_total);
END;
$function$;

REVOKE ALL ON FUNCTION public.create_manual_order(jsonb, jsonb, jsonb, text, numeric, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_manual_order(jsonb, jsonb, jsonb, text, numeric, text, text) TO authenticated, service_role;