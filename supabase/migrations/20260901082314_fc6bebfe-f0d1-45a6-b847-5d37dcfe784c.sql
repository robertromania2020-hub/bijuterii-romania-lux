ALTER TABLE public.product_images
  ADD COLUMN IF NOT EXISTS storage_path text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

DROP TRIGGER IF EXISTS product_images_touch ON public.product_images;
CREATE TRIGGER product_images_touch BEFORE UPDATE ON public.product_images
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP POLICY IF EXISTS "product images public read" ON storage.objects;
CREATE POLICY "product images public read" ON storage.objects
FOR SELECT TO anon, authenticated
USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "product images admin insert" ON storage.objects;
CREATE POLICY "product images admin insert" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "product images admin update" ON storage.objects;
CREATE POLICY "product images admin update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "product images admin delete" ON storage.objects;
CREATE POLICY "product images admin delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));