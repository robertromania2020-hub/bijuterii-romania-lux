DROP POLICY IF EXISTS "products public read active" ON public.products;

CREATE POLICY "products anon read active" ON public.products
  FOR SELECT TO anon USING (status = 'activ');

CREATE POLICY "products authenticated read" ON public.products
  FOR SELECT TO authenticated
  USING (status = 'activ' OR public.has_role(auth.uid(), 'admin'::app_role));

GRANT SELECT ON public.products, public.departments, public.categories, public.brands,
  public.collections, public.attribute_definitions, public.product_images,
  public.product_variants, public.product_attribute_values TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.departments, public.categories,
  public.brands, public.collections, public.attribute_definitions, public.product_images,
  public.product_variants, public.product_attribute_values TO authenticated;
GRANT ALL ON public.products, public.departments, public.categories, public.brands,
  public.collections, public.attribute_definitions, public.product_images,
  public.product_variants, public.product_attribute_values TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;