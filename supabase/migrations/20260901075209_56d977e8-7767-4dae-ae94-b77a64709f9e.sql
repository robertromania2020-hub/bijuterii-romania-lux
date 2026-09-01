-- ============ 1. ORDERS: extindere ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'ramburs',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'neplatita',
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS customer_notes text,
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS shipping_address jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders (user_id);

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START 1000;

-- ============ 2. ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text,
  variant_id text,
  product_name_snapshot text NOT NULL,
  sku_snapshot text NOT NULL DEFAULT '',
  variant_name_snapshot text,
  product_image_snapshot text,
  department_slug text NOT NULL DEFAULT '',
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON public.order_items (order_id);

GRANT SELECT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_items own select" ON public.order_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "order_items admin all" ON public.order_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 3. ORDER STATUS HISTORY ============
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by uuid,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS order_status_history_order_idx ON public.order_status_history (order_id);

GRANT SELECT ON public.order_status_history TO authenticated;
GRANT ALL ON public.order_status_history TO service_role;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_status_history own select" ON public.order_status_history
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "order_status_history admin all" ON public.order_status_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 4. INVENTORY HISTORY ============
CREATE TABLE IF NOT EXISTS public.inventory_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id text,
  variant_id text,
  previous_quantity integer NOT NULL DEFAULT 0,
  quantity_change integer NOT NULL DEFAULT 0,
  new_quantity integer NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT 'Ajustare manuală',
  reference_type text,
  reference_id text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS inventory_history_product_idx ON public.inventory_history (product_id);

GRANT SELECT ON public.inventory_history TO authenticated;
GRANT ALL ON public.inventory_history TO service_role;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "inventory_history admin all" ON public.inventory_history
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ 5. ORDERS: politici pentru clienți ============
CREATE POLICY "orders own select" ON public.orders
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ============ 6. ADRESE: câmpuri suplimentare ============
ALTER TABLE public.addresses
  ADD COLUMN IF NOT EXISTS first_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS street_number text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS building text,
  ADD COLUMN IF NOT EXISTS entrance text,
  ADD COLUMN IF NOT EXISTS floor text,
  ADD COLUMN IF NOT EXISTS apartment text,
  ADD COLUMN IF NOT EXISTS additional_information text;

-- ============ 7. STOC PE VARIANTĂ: prag stoc redus ============
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS min_stock integer NOT NULL DEFAULT 0;

-- ============ 8. PROTECȚIE STOC NEGATIV ============
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_nonneg;
ALTER TABLE public.products ADD CONSTRAINT products_stock_nonneg CHECK (stock >= 0);
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_stock_nonneg;
ALTER TABLE public.product_variants ADD CONSTRAINT product_variants_stock_nonneg CHECK (stock >= 0);

-- ============ 9. PLASARE COMANDĂ ATOMICĂ ============
CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_customer jsonb,
  p_shipping jsonb,
  p_payment_method text DEFAULT 'ramburs',
  p_customer_notes text DEFAULT NULL,
  p_coupon_code text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  IF COALESCE(p_payment_method, '') <> 'ramburs' THEN
    RAISE EXCEPTION 'Momentan este disponibilă doar plata ramburs.' USING HINT = 'APP';
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
    'ramburs', 'neplatita', p_coupon_code, p_customer_notes,
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

    -- reducere activă din baza de date
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
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, jsonb, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, jsonb, text, text, text) TO authenticated;

-- ============ 10. AJUSTARE STOC (ADMIN) ============
CREATE OR REPLACE FUNCTION public.adjust_stock(
  p_product_id text,
  p_variant_id text,
  p_new_quantity integer,
  p_reason text DEFAULT 'Ajustare manuală'
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Nu ai permisiunea de a modifica stocul.' USING HINT = 'APP';
  END IF;
  IF p_new_quantity IS NULL OR p_new_quantity < 0 THEN
    RAISE EXCEPTION 'Stocul nu poate fi negativ.' USING HINT = 'APP';
  END IF;

  IF p_variant_id IS NOT NULL AND p_variant_id <> '' THEN
    SELECT stock INTO v_prev FROM public.product_variants WHERE id = p_variant_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Varianta nu a fost găsită.' USING HINT = 'APP'; END IF;
    UPDATE public.product_variants SET stock = p_new_quantity WHERE id = p_variant_id;
  ELSE
    SELECT stock INTO v_prev FROM public.products WHERE id = p_product_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Produsul nu a fost găsit.' USING HINT = 'APP'; END IF;
    UPDATE public.products SET stock = p_new_quantity WHERE id = p_product_id;
  END IF;

  INSERT INTO public.inventory_history (
    product_id, variant_id, previous_quantity, quantity_change, new_quantity,
    reason, reference_type, changed_by
  ) VALUES (
    p_product_id, NULLIF(p_variant_id, ''), v_prev, p_new_quantity - v_prev, p_new_quantity,
    COALESCE(NULLIF(p_reason, ''), 'Ajustare manuală'), 'admin', auth.uid()
  );

  RETURN p_new_quantity;
END;
$$;

REVOKE ALL ON FUNCTION public.adjust_stock(text, text, integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.adjust_stock(text, text, integer, text) TO authenticated;

-- ============ 11. SCHIMBARE STATUS COMANDĂ (ADMIN, CU ISTORIC) ============
CREATE OR REPLACE FUNCTION public.set_order_status(
  p_order_id text,
  p_status text,
  p_note text DEFAULT NULL
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old text;
  v_it record;
  v_prev integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Nu ai permisiunea de a modifica comenzile.' USING HINT = 'APP';
  END IF;
  IF p_status NOT IN ('noua','confirmata','in_procesare','expediata','livrata','anulata','returnata') THEN
    RAISE EXCEPTION 'Status invalid.' USING HINT = 'APP';
  END IF;

  SELECT status INTO v_old FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Comanda nu a fost găsită.' USING HINT = 'APP'; END IF;
  IF v_old = p_status THEN RETURN; END IF;

  UPDATE public.orders SET status = p_status WHERE id = p_order_id;

  -- returnarea stocului la anulare sau retur
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
$$;

REVOKE ALL ON FUNCTION public.set_order_status(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_order_status(text, text, text) TO authenticated;

-- ============ 12. SUMAR CLIENȚI (ADMIN) ============
CREATE OR REPLACE FUNCTION public.admin_customers()
RETURNS TABLE (
  user_id uuid,
  first_name text,
  last_name text,
  email text,
  phone text,
  created_at timestamptz,
  orders_count bigint,
  total_spent numeric,
  last_order_at date
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.user_id, p.first_name, p.last_name, p.email, p.phone, p.created_at,
         COUNT(o.id) AS orders_count,
         COALESCE(SUM(o.total) FILTER (WHERE o.status <> 'anulata'), 0) AS total_spent,
         MAX(o.created_at) AS last_order_at
    FROM public.profiles p
    LEFT JOIN public.orders o ON o.user_id = p.user_id
   WHERE public.has_role(auth.uid(), 'admin')
   GROUP BY p.user_id, p.first_name, p.last_name, p.email, p.phone, p.created_at
   ORDER BY p.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_customers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_customers() TO authenticated;