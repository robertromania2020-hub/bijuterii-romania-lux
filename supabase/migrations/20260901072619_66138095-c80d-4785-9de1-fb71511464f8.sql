-- ============ PHASE 2: profiles + addresses ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles own select" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles own insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles own update" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Acasă',
  recipient text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  county text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'România',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses own select" ON public.addresses FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "addresses own write" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE TRIGGER addresses_touch BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.bootstrap_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', split_part(COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), ' ', 1)),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

-- ============ PHASE 3-5: catalog metadata ============
CREATE TABLE public.departments (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'peach',
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.departments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments public read" ON public.departments FOR SELECT USING (true);
CREATE POLICY "departments admin write" ON public.departments FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER departments_touch BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.categories (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  department_slug text NOT NULL REFERENCES public.departments(slug) ON UPDATE CASCADE,
  image text NOT NULL DEFAULT '',
  tone text NOT NULL DEFAULT 'peach',
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER categories_touch BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.brands (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  logo text,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brands TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brands TO authenticated;
GRANT ALL ON public.brands TO service_role;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "brands public read" ON public.brands FOR SELECT USING (true);
CREATE POLICY "brands admin write" ON public.brands FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER brands_touch BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.collections (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  department_slug text REFERENCES public.departments(slug) ON UPDATE CASCADE,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.collections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "collections public read" ON public.collections FOR SELECT USING (true);
CREATE POLICY "collections admin write" ON public.collections FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER collections_touch BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PHASE 9: flexible attribute definitions ============
CREATE TABLE public.attribute_definitions (
  id text PRIMARY KEY,
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  type text NOT NULL DEFAULT 'text',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  department_slug text,
  category_slugs jsonb NOT NULL DEFAULT '[]'::jsonb,
  filterable boolean NOT NULL DEFAULT false,
  show_on_product boolean NOT NULL DEFAULT true,
  unit text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.attribute_definitions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attribute_definitions TO authenticated;
GRANT ALL ON public.attribute_definitions TO service_role;
ALTER TABLE public.attribute_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attribute_definitions public read" ON public.attribute_definitions FOR SELECT USING (true);
CREATE POLICY "attribute_definitions admin write" ON public.attribute_definitions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER attribute_definitions_touch BEFORE UPDATE ON public.attribute_definitions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ============ PHASE 7/8/9: product children ============
CREATE TABLE public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  alt text,
  position integer NOT NULL DEFAULT 0,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_images_product_idx ON public.product_images(product_id, position);
GRANT SELECT ON public.product_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_images TO authenticated;
GRANT ALL ON public.product_images TO service_role;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_images public read" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "product_images admin write" ON public.product_images FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_label text NOT NULL DEFAULT '',
  label text NOT NULL,
  sku text NOT NULL DEFAULT '',
  price numeric(10,2),
  stock integer NOT NULL DEFAULT 0,
  image text,
  active boolean NOT NULL DEFAULT true,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_variants_product_idx ON public.product_variants(product_id, position);
GRANT SELECT ON public.product_variants TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_variants TO authenticated;
GRANT ALL ON public.product_variants TO service_role;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_variants public read" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "product_variants admin write" ON public.product_variants FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER product_variants_touch BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.product_attribute_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_key text NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, attribute_key)
);
GRANT SELECT ON public.product_attribute_values TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_attribute_values TO authenticated;
GRANT ALL ON public.product_attribute_values TO service_role;
ALTER TABLE public.product_attribute_values ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_attribute_values public read" ON public.product_attribute_values FOR SELECT USING (true);
CREATE POLICY "product_attribute_values admin write" ON public.product_attribute_values FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PHASE 12: seed catalog metadata from the previous static catalog ============
INSERT INTO public.departments (id,slug,name,description,image,tone,active,position,seo_title,seo_description) VALUES ('d1','bijuterii','Bijuterii','Inele, brățări, coliere și cercei din oțel inoxidabil, argint 925 și piese placate cu aur.','dept-bijuterii.jpg','peach',true,1,'Bijuterii — inele, brățări, coliere, cercei','Bijuterii din oțel inoxidabil și placate cu aur. Filtrează după categorie, material, culoare și preț.');
INSERT INTO public.departments (id,slug,name,description,image,tone,active,position,seo_title,seo_description) VALUES ('d2','machiaj','Machiaj','Fond de ten, farduri, rujuri, mascara și tot ce îți trebuie pentru un machiaj complet.','dept-machiaj.jpg','lilac',true,2,'Machiaj — fond de ten, farduri, rujuri, mascara','Produse de machiaj de la branduri cunoscute. Filtrează după brand, nuanță, finish și preț.');
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c1','inele','Inele','bijuterii','cat-inele.jpg','mint',true,1);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c2','bratari','Brățări','bijuterii','cat-bratari.jpg','peach',true,2);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c3','coliere','Coliere','bijuterii','cat-coliere.jpg','lilac',true,3);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c4','cercei','Cercei','bijuterii','cat-cercei.jpg','mint',true,4);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c5','seturi','Seturi','bijuterii','p-set-cadou.jpg','peach',true,5);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c6','placate-cu-aur','Bijuterii placate cu aur','bijuterii','col-gold.jpg','lilac',true,6);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('c7','otel','Bijuterii din oțel','bijuterii','col-minimal.jpg','mint',true,7);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m1','fond-de-ten','Fond de ten','machiaj','cat-fond-ten.jpg','mint',true,1);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m2','pudra','Pudră','machiaj','cat-fond-ten.jpg','peach',true,2);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m3','farduri','Farduri','machiaj','cat-farduri.jpg','lilac',true,3);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m4','palete-de-farduri','Palete de farduri','machiaj','cat-farduri.jpg','mint',true,4);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m5','rujuri','Rujuri','machiaj','cat-rujuri.jpg','peach',true,5);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m6','gloss','Gloss','machiaj','cat-rujuri.jpg','lilac',true,6);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m7','mascara','Mascara','machiaj','p-mascara.jpg','mint',true,7);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m8','eyeliner','Eyeliner','machiaj','p-mascara.jpg','peach',true,8);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m9','blush','Blush','machiaj','cat-farduri.jpg','lilac',true,9);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m10','bronzer','Bronzer','machiaj','cat-farduri.jpg','mint',true,10);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m11','contur','Contur','machiaj','cat-fond-ten.jpg','peach',true,11);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m12','iluminator','Iluminator','machiaj','cat-farduri.jpg','lilac',true,12);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m13','primer','Primer','machiaj','cat-fond-ten.jpg','mint',true,13);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m14','corector','Corector','machiaj','cat-fond-ten.jpg','peach',true,14);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m15','creioane-de-buze','Creioane de buze','machiaj','cat-rujuri.jpg','lilac',true,15);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m16','creioane-de-ochi','Creioane de ochi','machiaj','p-mascara.jpg','mint',true,16);
INSERT INTO public.categories (id,slug,name,department_slug,image,tone,active,position) VALUES ('m17','fixator-machiaj','Fixator machiaj','machiaj','cat-fond-ten.jpg','peach',true,17);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b1','bijuterii-studio','BIJUTERII Studio',NULL,true,1);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b2','maybelline','Maybelline',NULL,true,2);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b3','loreal','L''Oréal',NULL,true,3);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b4','nyx','NYX',NULL,true,4);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b5','mac','MAC',NULL,true,5);
INSERT INTO public.brands (id,slug,name,logo,active,position) VALUES ('b6','essence','Essence',NULL,true,6);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k1','gold-collection','Gold Collection','Piese placate cu aur de 18K, pentru zilele în care vrei să strălucești.','col-gold.jpg','bijuterii',true,1);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k2','stainless-steel','Stainless Steel','Oțel inoxidabil rezistent la apă, potrivit pentru purtare zilnică.','col-minimal.jpg','bijuterii',true,2);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k3','minimal','Minimal','Linii curate și forme discrete, pentru un stil fără efort.','p-colier-delicat.jpg','bijuterii',true,3);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k4','elegance','Elegance','Bijuterii statement pentru ocazii speciale.','p-inel-signet.jpg','bijuterii',true,4);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k5','cadouri','Cadouri','Seturi ambalate cadou, gata de dăruit.','p-set-cadou.jpg',NULL,true,5);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k6','nude-essentials','Nude Essentials','Nuanțe naturale de zi, pentru un machiaj discret și luminos.','p-ruj-matte.jpg','machiaj',true,6);
INSERT INTO public.collections (id,slug,name,description,image,department_slug,active,position) VALUES ('k7','glam-night','Glam Night','Farduri intense și texturi de lungă durată pentru serile speciale.','cat-farduri.jpg','machiaj',true,7);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a1','material','Material','select','["Oțel inoxidabil","Placat cu aur","Argint 925","Perle"]'::jsonb,'bijuterii','[]'::jsonb,true,true,NULL,1);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a2','culoare','Culoare','select','["Auriu","Argintiu","Roze","Negru"]'::jsonb,'bijuterii','[]'::jsonb,true,true,NULL,2);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a3','marime','Mărime','select','["16 mm","17 mm","18 mm","19 mm"]'::jsonb,'bijuterii','["inele","seturi"]'::jsonb,true,true,NULL,3);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a4','dimensiune','Dimensiune','text','[]'::jsonb,'bijuterii','[]'::jsonb,false,true,NULL,4);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a5','tip_placare','Tip placare','select','["Aur 18K","Aur 14K","Rodiu","Fără placare"]'::jsonb,'bijuterii','[]'::jsonb,false,true,NULL,5);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a6','greutate','Greutate','number','[]'::jsonb,'bijuterii','[]'::jsonb,false,true,'g',6);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a7','nuanta','Nuanță','select','["Nude","Roz","Roșu","Maro","Bej","Coral"]'::jsonb,'machiaj','[]'::jsonb,true,true,NULL,1);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a8','cod_nuanta','Cod nuanță','text','[]'::jsonb,'machiaj','[]'::jsonb,false,true,NULL,2);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a9','finish','Finish','select','["Mat","Satinat","Lucios","Shimmer","Natural"]'::jsonb,'machiaj','[]'::jsonb,true,true,NULL,3);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a10','tip_produs','Tip produs','select','["Lichid","Cremă","Pudră","Stick","Creion"]'::jsonb,'machiaj','[]'::jsonb,true,true,NULL,4);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a11','volum','Volum','text','[]'::jsonb,'machiaj','[]'::jsonb,false,true,NULL,5);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a12','gramaj','Gramaj','text','[]'::jsonb,'machiaj','[]'::jsonb,false,true,NULL,6);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a13','ingrediente','Ingrediente','text','[]'::jsonb,'machiaj','[]'::jsonb,false,true,NULL,7);
INSERT INTO public.attribute_definitions (id,key,label,type,options,department_slug,category_slugs,filterable,show_on_product,unit,position) VALUES ('a14','vegan','Formulă vegană','boolean','[]'::jsonb,'machiaj','[]'::jsonb,false,true,NULL,8);

-- migrate existing product jsonb data into the normalised tables
INSERT INTO public.product_images (product_id, url, position, is_primary)
SELECT p.id, img.value #>> '{}', (img.ordinality - 1)::int, img.ordinality = 1
FROM public.products p, jsonb_array_elements(p.images) WITH ORDINALITY AS img(value, ordinality)
WHERE jsonb_typeof(p.images) = 'array';

INSERT INTO public.product_variants (id, product_id, attribute_label, label, sku, price, stock, image, active, position)
SELECT COALESCE(v.value ->> 'id', p.id || '-v' || v.ordinality), p.id,
       COALESCE(v.value ->> 'attributeLabel',''), COALESCE(v.value ->> 'label',''),
       COALESCE(v.value ->> 'sku',''), NULLIF(v.value ->> 'price','')::numeric,
       COALESCE((v.value ->> 'stock')::int, 0), v.value ->> 'image',
       COALESCE((v.value ->> 'active')::boolean, true), (v.ordinality - 1)::int
FROM public.products p, jsonb_array_elements(p.variants) WITH ORDINALITY AS v(value, ordinality)
WHERE jsonb_typeof(p.variants) = 'array';

INSERT INTO public.product_attribute_values (product_id, attribute_key, value)
SELECT p.id, a.key, a.value
FROM public.products p, jsonb_each(p.attributes) AS a(key, value)
WHERE jsonb_typeof(p.attributes) = 'object'
ON CONFLICT (product_id, attribute_key) DO NOTHING;

ALTER TABLE public.products DROP COLUMN images, DROP COLUMN variants, DROP COLUMN attributes;

-- ============ PHASE 6/11: products hardening ============
ALTER TABLE public.products
  ALTER COLUMN price TYPE numeric(10,2),
  ALTER COLUMN old_price TYPE numeric(10,2);
ALTER TABLE public.products
  ADD CONSTRAINT products_department_fk FOREIGN KEY (department_slug) REFERENCES public.departments(slug) ON UPDATE CASCADE,
  ADD CONSTRAINT products_category_fk FOREIGN KEY (category_slug) REFERENCES public.categories(slug) ON UPDATE CASCADE,
  ADD CONSTRAINT products_brand_fk FOREIGN KEY (brand_slug) REFERENCES public.brands(slug) ON UPDATE CASCADE ON DELETE SET NULL,
  ADD CONSTRAINT products_collection_fk FOREIGN KEY (collection_slug) REFERENCES public.collections(slug) ON UPDATE CASCADE ON DELETE SET NULL;

DROP POLICY IF EXISTS "products public read" ON public.products;
CREATE POLICY "products public read active" ON public.products FOR SELECT USING (status = 'activ' OR public.has_role(auth.uid(),'admin'));