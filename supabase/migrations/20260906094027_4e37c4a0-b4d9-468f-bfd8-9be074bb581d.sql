-- 1. Extinderea definițiilor de atribute
alter table public.attribute_definitions
  add column if not exists required boolean not null default false,
  add column if not exists is_variant boolean not null default false,
  add column if not exists swatches jsonb not null default '{}'::jsonb,
  add column if not exists active boolean not null default true;

alter table public.attribute_definitions drop constraint if exists attribute_definitions_key_key;
create unique index if not exists attribute_definitions_dep_key_uniq
  on public.attribute_definitions (coalesce(department_slug, '*'), key);

-- 2. Extinderea variantelor de produs
alter table public.product_variants
  add column if not exists old_price numeric,
  add column if not exists barcode text,
  add column if not exists attribute_key text,
  add column if not exists option_values jsonb not null default '{}'::jsonb;

create index if not exists product_variants_product_idx on public.product_variants (product_id);
-- categorii noi
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-bratari-de-glezna', 'bratari-de-glezna', 'Brățări de gleznă', 'bijuterii', '', 'lilac', true, 11)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-lantisoare', 'lantisoare', 'Lănțișoare', 'bijuterii', '', 'lilac', true, 12)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-pandantive', 'pandantive', 'Pandantive', 'bijuterii', '', 'lilac', true, 13)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-brose', 'brose', 'Broșe', 'bijuterii', '', 'lilac', true, 14)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-accesorii', 'accesorii', 'Accesorii', 'bijuterii', '', 'lilac', true, 15)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-ingrijirea-tenului', 'ingrijirea-tenului', 'Îngrijirea tenului', 'machiaj', '', 'lilac', true, 18)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-oje', 'oje', 'Oje', 'machiaj', '', 'lilac', true, 19)
on conflict (slug) do update set name = excluded.name, active = true;
insert into public.categories (id, slug, name, department_slug, image, tone, active, position)
values ('cat-geluri-unghii', 'geluri-unghii', 'Geluri pentru unghii', 'machiaj', '', 'lilac', true, 20)
on conflict (slug) do update set name = excluded.name, active = true;
update public.categories set active = false where slug = 'pandantiv';

-- definiții de atribute
delete from public.attribute_definitions where id ~ '^a[0-9]+$';
insert into public.attribute_definitions
 (id, key, label, type, options, department_slug, category_slugs, filterable, show_on_product, unit, position, required, is_variant, swatches, active)
values
('attr-bijuterii-marime_inel', 'marime_inel', 'Mărime', 'multi', '["6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32"]'::jsonb, 'bijuterii', '["inele","seturi"]'::jsonb, true, true, null, 1, true, true, '{}'::jsonb, true),
('attr-bijuterii-material', 'material', 'Material', 'select', '["Oțel inoxidabil","Oțel 316L","Alamă","Argint","Argint 925","Metal","Cupru","Titan","Aur","Aliaj","Alte materiale"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","lantisoare","pandantive","seturi","brose","accesorii"]'::jsonb, true, true, null, 2, false, false, '{}'::jsonb, true),
('attr-bijuterii-culoare_metal', 'culoare_metal', 'Culoarea metalului', 'select', '["Auriu","Argintiu","Rose Gold","Negru","Alb","Multicolor"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","lantisoare","pandantive","seturi"]'::jsonb, true, true, null, 3, false, false, '{"Auriu":"#d4af37","Argintiu":"#c0c0c0","Rose Gold":"#b76e79","Negru":"#1c1c1c","Alb":"#f5f5f5","Multicolor":"#9b5de5"}'::jsonb, true),
('attr-bijuterii-culoare', 'culoare', 'Culoare', 'select', '["Auriu","Argintiu","Rose Gold","Negru","Alb","Roșu","Roz","Albastru","Verde","Mov","Galben","Maro","Multicolor"]'::jsonb, 'bijuterii', '["brose","accesorii"]'::jsonb, true, true, null, 4, false, false, '{"Auriu":"#d4af37","Argintiu":"#c0c0c0","Rose Gold":"#b76e79","Negru":"#1c1c1c","Alb":"#f5f5f5","Multicolor":"#9b5de5","Roșu":"#c62828","Roz":"#ec9bb0","Albastru":"#2f6fd0","Verde":"#2e8b57","Mov":"#8e5bd0","Galben":"#f2c744","Maro":"#8b5e3c"}'::jsonb, true),
('attr-bijuterii-finisaj', 'finisaj', 'Finisaj', 'select', '["Lucios","Mat","Satinat","Periat","Texturat","Polished","Hammered"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","lantisoare","pandantive","seturi","brose","accesorii"]'::jsonb, true, true, null, 5, false, false, '{}'::jsonb, true),
('attr-bijuterii-placare', 'placare', 'Tip placare', 'select', '["Fără placare","Placat cu aur","Placat cu aur 18K","Placat cu aur 14K","Placat cu aur roz","Placat cu rodiu","Placat cu argint","PVD","Altă placare"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","coliere","lantisoare","pandantive","seturi","accesorii"]'::jsonb, true, true, null, 6, false, false, '{}'::jsonb, true),
('attr-bijuterii-grosime', 'grosime', 'Grosime', 'number', '[]'::jsonb, 'bijuterii', '["inele","coliere","lantisoare","bratari"]'::jsonb, false, true, 'mm', 7, false, false, '{}'::jsonb, true),
('attr-bijuterii-latime', 'latime', 'Lățime', 'number', '[]'::jsonb, 'bijuterii', '["inele","cercei","bratari","pandantive","brose","accesorii"]'::jsonb, false, true, 'mm', 8, false, false, '{}'::jsonb, true),
('attr-bijuterii-lungime', 'lungime', 'Lungime', 'number', '[]'::jsonb, 'bijuterii', '["cercei","pandantive","brose","accesorii"]'::jsonb, false, true, 'mm', 9, false, false, '{}'::jsonb, true),
('attr-bijuterii-diametru', 'diametru', 'Diametru', 'number', '[]'::jsonb, 'bijuterii', '["cercei"]'::jsonb, false, true, 'mm', 10, false, false, '{}'::jsonb, true),
('attr-bijuterii-greutate', 'greutate', 'Greutate', 'number', '[]'::jsonb, 'bijuterii', '["cercei"]'::jsonb, false, true, 'g', 11, false, false, '{}'::jsonb, true),
('attr-bijuterii-dimensiune', 'dimensiune', 'Dimensiune', 'text', '[]'::jsonb, 'bijuterii', '["accesorii"]'::jsonb, false, true, null, 12, false, false, '{}'::jsonb, true),
('attr-bijuterii-model', 'model', 'Model', 'text', '[]'::jsonb, 'bijuterii', '["accesorii"]'::jsonb, false, true, null, 13, false, false, '{}'::jsonb, true),
('attr-bijuterii-forma', 'forma', 'Formă', 'select', '["Rotundă","Ovală","Pătrată","Dreptunghiulară","Inimă","Stea","Fluture","Cruce","Floare","Geometrică","Infinit","Lacrimă","Altă formă"]'::jsonb, 'bijuterii', '["inele","pandantive","brose"]'::jsonb, true, true, null, 14, false, false, '{}'::jsonb, true),
('attr-bijuterii-stil', 'stil', 'Stil', 'select', '["Minimalist","Clasic","Modern","Vintage","Boho","Statement","Romantic","Elegant"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","lantisoare","pandantive","seturi","brose","accesorii"]'::jsonb, true, true, null, 15, false, false, '{}'::jsonb, true),
('attr-bijuterii-piatra', 'piatra', 'Piatră', 'select', '["Zirconia","Cubic Zirconia","Cristal","Perle","Cristale","Onix","Agat","Ametist","Turcoaz","Opal","Labradorit","Jad","Granat","Topaz","Alte pietre"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","pandantive","seturi","brose"]'::jsonb, true, true, null, 16, false, false, '{}'::jsonb, true),
('attr-bijuterii-culoare_piatra', 'culoare_piatra', 'Culoarea pietrei', 'select', '["Transparent","Alb","Negru","Roșu","Roz","Albastru","Verde","Mov","Galben","Portocaliu","Maro","Multicolor"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","pandantive","seturi","brose"]'::jsonb, true, true, null, 17, false, false, '{"Transparent":"#e8f1f5","Alb":"#ffffff","Negru":"#1c1c1c","Roșu":"#c62828","Roz":"#ec9bb0","Albastru":"#2f6fd0","Verde":"#2e8b57","Mov":"#8e5bd0","Galben":"#f2c744","Portocaliu":"#ef7a35","Maro":"#8b5e3c","Multicolor":"#9b5de5"}'::jsonb, true),
('attr-bijuterii-forma_piatra', 'forma_piatra', 'Formă piatră', 'select', '["Rotundă","Ovală","Pară","Marchiză","Inimă","Smarald","Princess","Baghetă","Trilion","Asscher","Cushion"]'::jsonb, 'bijuterii', '["inele","cercei","coliere","pandantive"]'::jsonb, false, true, null, 18, false, false, '{}'::jsonb, true),
('attr-bijuterii-numar_pietre', 'numar_pietre', 'Număr pietre', 'number', '[]'::jsonb, 'bijuterii', '["inele","pandantive"]'::jsonb, false, true, null, 19, false, false, '{}'::jsonb, true),
('attr-bijuterii-tip_montura', 'tip_montura', 'Tip montură', 'select', '["Griffe","Bezel","Pavé","Canal","Tensiune","Invisible","Lipită"]'::jsonb, 'bijuterii', '["inele"]'::jsonb, false, true, null, 20, false, false, '{}'::jsonb, true),
('attr-bijuterii-ocazie', 'ocazie', 'Ocazie', 'select', '["Zi cu zi","Birou","Cadou","Ocazie specială","Nuntă","Aniversare","Petrecere"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","coliere","pandantive","seturi","brose","accesorii"]'::jsonb, true, true, null, 21, false, false, '{}'::jsonb, true),
('attr-bijuterii-gen', 'gen', 'Gen', 'select', '["Damă","Bărbați","Unisex","Copii"]'::jsonb, 'bijuterii', '["inele","cercei","bratari","bratari-de-glezna","coliere","lantisoare","pandantive","seturi","brose","accesorii"]'::jsonb, true, true, null, 22, false, false, '{}'::jsonb, true),
('attr-bijuterii-tip_cercei', 'tip_cercei', 'Tip cercei', 'select', '["Stud","Hoop","Huggie","Drop","Dangle","Ear cuff","Statement","Clip-on"]'::jsonb, 'bijuterii', '["cercei"]'::jsonb, true, true, null, 23, false, false, '{}'::jsonb, true),
('attr-bijuterii-inchidere', 'inchidere', 'Sistem de închidere', 'select', '["Fluturaș","Șurub","Clips","Cârlig","Englezesc","Carabinieră","Lobster","Toggle","Magnetic","Arc","Elastic","Fără închidere"]'::jsonb, 'bijuterii', '["cercei","bratari","bratari-de-glezna","coliere","lantisoare"]'::jsonb, false, true, null, 24, false, false, '{}'::jsonb, true),
('attr-bijuterii-tip_bratara', 'tip_bratara', 'Tip brățară', 'select', '["Lanț","Rigidă (bangle)","Tenis","Charm","Șnur","Împletită","Cuff","Mărgele"]'::jsonb, 'bijuterii', '["bratari"]'::jsonb, true, true, null, 25, false, false, '{}'::jsonb, true),
('attr-bijuterii-lungime_bratara', 'lungime_bratara', 'Lungime', 'multi', '["15 cm","16 cm","17 cm","18 cm","19 cm","20 cm","21 cm","22 cm","Reglabilă"]'::jsonb, 'bijuterii', '["bratari"]'::jsonb, true, true, null, 26, false, true, '{}'::jsonb, true),
('attr-bijuterii-lungime_glezna', 'lungime_glezna', 'Lungime', 'multi', '["22 cm","23 cm","24 cm","25 cm","26 cm","27 cm","28 cm","Reglabilă"]'::jsonb, 'bijuterii', '["bratari-de-glezna"]'::jsonb, true, true, null, 27, false, true, '{}'::jsonb, true),
('attr-bijuterii-marime_glezna', 'marime_glezna', 'Mărime', 'select', '["S","M","L","Universală"]'::jsonb, 'bijuterii', '["bratari-de-glezna"]'::jsonb, false, true, null, 28, false, false, '{}'::jsonb, true),
('attr-bijuterii-lungime_colier', 'lungime_colier', 'Lungime', 'multi', '["35 cm","38 cm","40 cm","42 cm","45 cm","50 cm","55 cm","60 cm","70 cm","80 cm"]'::jsonb, 'bijuterii', '["coliere","lantisoare"]'::jsonb, true, true, null, 29, false, true, '{}'::jsonb, true),
('attr-bijuterii-tip_colier', 'tip_colier', 'Tip colier', 'select', '["Choker","Colier scurt","Colier mediu","Colier lung","Sautoir","Lariat","Colier cu pandantiv","Colier statement"]'::jsonb, 'bijuterii', '["coliere"]'::jsonb, true, true, null, 30, false, false, '{}'::jsonb, true),
('attr-bijuterii-tip_lant', 'tip_lant', 'Tip lanț', 'select', '["Figaro","Cuban","Curb","Rope","Box","Snake","Paperclip","Singapore","Venetian","Wheat","Ball","Rolo","Franco","Cable"]'::jsonb, 'bijuterii', '["coliere","lantisoare","bratari-de-glezna"]'::jsonb, true, true, null, 31, false, false, '{}'::jsonb, true),
('attr-bijuterii-pandantiv', 'pandantiv', 'Pandantiv', 'text', '[]'::jsonb, 'bijuterii', '["coliere"]'::jsonb, false, true, null, 32, false, false, '{}'::jsonb, true),
('attr-bijuterii-tip_prindere', 'tip_prindere', 'Tip prindere', 'select', '["Bail","Inel deschis","Agrafă","Clips"]'::jsonb, 'bijuterii', '["pandantive"]'::jsonb, false, true, null, 33, false, false, '{}'::jsonb, true),
('attr-bijuterii-sistem_prindere', 'sistem_prindere', 'Sistem de prindere', 'select', '["Ac cu siguranță","Clips","Magnet","Ac dublu"]'::jsonb, 'bijuterii', '["brose"]'::jsonb, false, true, null, 34, false, false, '{}'::jsonb, true),
('attr-bijuterii-componenta_set', 'componenta_set', 'Componența setului', 'select', '["Inel + cercei","Colier + cercei","Colier + brățară","Colier + cercei + brățară","Set complet","Altă combinație"]'::jsonb, 'bijuterii', '["seturi"]'::jsonb, true, true, null, 35, false, false, '{}'::jsonb, true),
('attr-machiaj-nuanta', 'nuanta', 'Nuanță', 'text', '[]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra","rujuri","gloss","blush","bronzer","contur","iluminator","farduri","oje","geluri-unghii","creioane-de-buze"]'::jsonb, true, true, null, 36, true, true, '{}'::jsonb, true),
('attr-machiaj-cod_nuanta', 'cod_nuanta', 'Cod nuanță', 'text', '[]'::jsonb, 'machiaj', '["fond-de-ten","corector","rujuri","gloss","pudra","oje","geluri-unghii"]'::jsonb, false, true, null, 37, false, false, '{}'::jsonb, true),
('attr-machiaj-subton', 'subton', 'Subton', 'select', '["Cald","Rece","Neutru"]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra","rujuri","gloss","blush","bronzer","iluminator"]'::jsonb, true, true, null, 38, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_ten', 'tip_ten', 'Tip ten', 'select', '["Uscat","Normal","Mixt","Gras","Sensibil"]'::jsonb, 'machiaj', '["fond-de-ten","corector","primer","fixator-machiaj","ingrijirea-tenului"]'::jsonb, true, true, null, 39, false, false, '{}'::jsonb, true),
('attr-machiaj-acoperire', 'acoperire', 'Acoperire', 'select', '["Mică","Medie","Mare","Full coverage"]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra"]'::jsonb, true, true, null, 40, false, false, '{}'::jsonb, true),
('attr-machiaj-finisaj_ten', 'finisaj_ten', 'Finisaj', 'select', '["Mat","Natural","Dewy","Satin"]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra","primer","fixator-machiaj"]'::jsonb, true, true, null, 41, false, false, '{}'::jsonb, true),
('attr-machiaj-finisaj_buze', 'finisaj_buze', 'Finisaj', 'select', '["Matte","Satin","Glossy","Cream","Metallic","Shimmer"]'::jsonb, 'machiaj', '["rujuri","gloss","creioane-de-buze"]'::jsonb, true, true, null, 42, false, false, '{}'::jsonb, true),
('attr-machiaj-finisaj_farduri', 'finisaj_farduri', 'Finisaj', 'select', '["Matte","Shimmer","Metallic","Glitter","Satin","Duo-chrome"]'::jsonb, 'machiaj', '["farduri","palete-de-farduri","blush","bronzer","iluminator"]'::jsonb, true, true, null, 43, false, false, '{}'::jsonb, true),
('attr-machiaj-finisaj_oje', 'finisaj_oje', 'Finisaj', 'select', '["Glossy","Matte","Metallic","Glitter","Shimmer","Pearl","Chrome"]'::jsonb, 'machiaj', '["oje","geluri-unghii"]'::jsonb, true, true, null, 44, false, false, '{}'::jsonb, true),
('attr-machiaj-textura', 'textura', 'Textură', 'select', '["Cremoasă","Lichidă","Pudră","Gel","Balsam","Ulei","Spumă","Stick","Compactă"]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra","rujuri","gloss","blush","bronzer","iluminator","farduri","palete-de-farduri","primer","fixator-machiaj","ingrijirea-tenului"]'::jsonb, false, true, null, 45, false, false, '{}'::jsonb, true),
('attr-machiaj-efect', 'efect', 'Efect', 'select', '["Hidratant","Volumizant","Iluminator","Matifiant","Plumping","Radiant","Natural","Glow","Blurring"]'::jsonb, 'machiaj', '["rujuri","gloss","blush","bronzer","iluminator","farduri","mascara","primer","fixator-machiaj","oje"]'::jsonb, true, true, null, 46, false, false, '{}'::jsonb, true),
('attr-machiaj-rezistenta', 'rezistenta', 'Rezistență', 'select', '["4 ore","8 ore","12 ore","16 ore","24 ore","Long lasting","Transfer proof"]'::jsonb, 'machiaj', '["rujuri","gloss","fond-de-ten","eyeliner","mascara","fixator-machiaj","creioane-de-ochi"]'::jsonb, false, true, null, 47, false, false, '{}'::jsonb, true),
('attr-machiaj-cantitate', 'cantitate', 'Cantitate', 'text', '[]'::jsonb, 'machiaj', '["fond-de-ten","corector","pudra","rujuri","gloss","blush","bronzer","iluminator","farduri","palete-de-farduri","eyeliner","mascara","primer","fixator-machiaj","ingrijirea-tenului","oje","geluri-unghii","contur","creioane-de-buze","creioane-de-ochi"]'::jsonb, false, true, null, 48, false, false, '{}'::jsonb, true),
('attr-machiaj-formula', 'formula', 'Formulă', 'select', '["Vegană","Fără parabeni","Hipoalergenică","Cu acid hialuronic","Cu vitamina E","Cu unt de shea","Cu ulei","Clean beauty"]'::jsonb, 'machiaj', '["fond-de-ten","rujuri","mascara"]'::jsonb, false, true, null, 49, false, false, '{}'::jsonb, true),
('attr-machiaj-spf', 'spf', 'SPF', 'select', '["Fără SPF","SPF 15","SPF 20","SPF 30","SPF 50"]'::jsonb, 'machiaj', '["fond-de-ten","primer","ingrijirea-tenului"]'::jsonb, true, true, null, 50, false, false, '{}'::jsonb, true),
('attr-machiaj-pigmentare', 'pigmentare', 'Pigmentare', 'select', '["Ușoară","Medie","Intensă"]'::jsonb, 'machiaj', '["farduri","palete-de-farduri"]'::jsonb, false, true, null, 51, false, false, '{}'::jsonb, true),
('attr-machiaj-numar_nuante', 'numar_nuante', 'Număr nuanțe', 'number', '[]'::jsonb, 'machiaj', '["palete-de-farduri"]'::jsonb, false, true, null, 52, false, false, '{}'::jsonb, true),
('attr-machiaj-nuante_incluse', 'nuante_incluse', 'Nuanțe incluse', 'text', '[]'::jsonb, 'machiaj', '["palete-de-farduri"]'::jsonb, false, true, null, 53, false, false, '{}'::jsonb, true),
('attr-machiaj-dimensiune_paleta', 'dimensiune_paleta', 'Dimensiune', 'select', '["Mini","Medie","Mare"]'::jsonb, 'machiaj', '["palete-de-farduri"]'::jsonb, false, true, null, 54, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_eyeliner', 'tip_eyeliner', 'Tip', 'select', '["Creion","Gel","Lichid","Pen"]'::jsonb, 'machiaj', '["eyeliner","creioane-de-ochi"]'::jsonb, true, true, null, 55, false, false, '{}'::jsonb, true),
('attr-machiaj-culoare_machiaj', 'culoare_machiaj', 'Culoare', 'select', '["Auriu","Argintiu","Rose Gold","Negru","Alb","Roșu","Roz","Albastru","Verde","Mov","Galben","Maro","Multicolor"]'::jsonb, 'machiaj', '["eyeliner","mascara","creioane-de-ochi"]'::jsonb, true, true, null, 56, false, false, '{"Auriu":"#d4af37","Argintiu":"#c0c0c0","Rose Gold":"#b76e79","Negru":"#1c1c1c","Alb":"#f5f5f5","Multicolor":"#9b5de5","Roșu":"#c62828","Roz":"#ec9bb0","Albastru":"#2f6fd0","Verde":"#2e8b57","Mov":"#8e5bd0","Galben":"#f2c744","Maro":"#8b5e3c"}'::jsonb, true),
('attr-machiaj-waterproof', 'waterproof', 'Waterproof', 'boolean', '[]'::jsonb, 'machiaj', '["eyeliner","mascara","creioane-de-ochi"]'::jsonb, true, true, null, 57, false, false, '{}'::jsonb, true),
('attr-machiaj-volum', 'volum', 'Volum', 'select', '["Ușor","Mediu","Extrem"]'::jsonb, 'machiaj', '["mascara"]'::jsonb, false, true, null, 58, false, false, '{}'::jsonb, true),
('attr-machiaj-lungire', 'lungire', 'Lungire', 'select', '["Ușoară","Medie","Intensă"]'::jsonb, 'machiaj', '["mascara"]'::jsonb, false, true, null, 59, false, false, '{}'::jsonb, true),
('attr-machiaj-curbare', 'curbare', 'Curbare', 'select', '["Ușoară","Medie","Intensă"]'::jsonb, 'machiaj', '["mascara"]'::jsonb, false, true, null, 60, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_pudra', 'tip_pudra', 'Tip', 'select', '["Compactă","Pulbere liberă","Mineral","Bronzantă"]'::jsonb, 'machiaj', '["pudra"]'::jsonb, false, true, null, 61, false, false, '{}'::jsonb, true),
('attr-machiaj-beneficii', 'beneficii', 'Beneficii', 'multi', '["Hidratare","Anti-aging","Matifiere","Iluminare","Curățare","Calmarea pielii","Anti-imperfecțiuni","Protecție solară"]'::jsonb, 'machiaj', '["primer","ingrijirea-tenului"]'::jsonb, true, true, null, 62, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_fixator', 'tip_fixator', 'Tip', 'select', '["Spray","Pudră","Gel"]'::jsonb, 'machiaj', '["fixator-machiaj"]'::jsonb, false, true, null, 63, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_produs_ten', 'tip_produs_ten', 'Tip produs', 'select', '["Cremă","Ser","Loțiune","Gel de curățare","Apă micelară","Mască","Exfoliant","Tonic","Contur ochi","Protecție solară"]'::jsonb, 'machiaj', '["ingrijirea-tenului"]'::jsonb, true, true, null, 64, false, false, '{}'::jsonb, true),
('attr-machiaj-ingredient_principal', 'ingredient_principal', 'Ingredient principal', 'text', '[]'::jsonb, 'machiaj', '["ingrijirea-tenului"]'::jsonb, false, true, null, 65, false, false, '{}'::jsonb, true),
('attr-machiaj-parfumat', 'parfumat', 'Parfumat', 'boolean', '[]'::jsonb, 'machiaj', '["ingrijirea-tenului"]'::jsonb, false, true, null, 66, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_oja', 'tip_oja', 'Tip', 'select', '["Clasică","Semipermanentă","Gel","Bază","Top coat"]'::jsonb, 'machiaj', '["oje"]'::jsonb, true, true, null, 67, false, false, '{}'::jsonb, true),
('attr-machiaj-tip_gel', 'tip_gel', 'Tip gel', 'select', '["Constructie","Color","Bază","Top","UV/LED"]'::jsonb, 'machiaj', '["geluri-unghii"]'::jsonb, false, true, null, 68, false, false, '{}'::jsonb, true),
('attr-machiaj-consistenta', 'consistenta', 'Consistență', 'select', '["Fluidă","Medie","Densă"]'::jsonb, 'machiaj', '["geluri-unghii"]'::jsonb, false, true, null, 69, false, false, '{}'::jsonb, true),
('attr-machiaj-timp_polimerizare', 'timp_polimerizare', 'Timp de polimerizare', 'text', '[]'::jsonb, 'machiaj', '["geluri-unghii"]'::jsonb, false, true, null, 70, false, false, '{}'::jsonb, true),
('attr-parfumuri-cantitate_parfum', 'cantitate_parfum', 'Cantitate', 'multi', '["10 ml","30 ml","50 ml","75 ml","100 ml","150 ml"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, true, true, null, 71, true, true, '{}'::jsonb, true),
('attr-parfumuri-concentratie', 'concentratie', 'Concentrație', 'select', '["Parfum","Eau de Parfum","Eau de Toilette","Eau de Cologne","Body Mist"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, true, true, null, 72, false, false, '{}'::jsonb, true),
('attr-parfumuri-familie_olfactiva', 'familie_olfactiva', 'Familie olfactivă', 'select', '["Florală","Orientală","Lemnoasă","Proaspătă","Citrică","Fructată","Gourmand","Aromatică","Chypre","Acvatică"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, true, true, null, 73, false, false, '{}'::jsonb, true),
('attr-parfumuri-note_varf', 'note_varf', 'Note de vârf', 'text', '[]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, false, true, null, 74, false, false, '{}'::jsonb, true),
('attr-parfumuri-note_mijloc', 'note_mijloc', 'Note de mijloc', 'text', '[]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, false, true, null, 75, false, false, '{}'::jsonb, true),
('attr-parfumuri-note_baza', 'note_baza', 'Note de bază', 'text', '[]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, false, true, null, 76, false, false, '{}'::jsonb, true),
('attr-parfumuri-gen_parfum', 'gen_parfum', 'Gen', 'select', '["Damă","Bărbați","Unisex","Copii"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, true, true, null, 77, false, false, '{}'::jsonb, true),
('attr-parfumuri-sezon', 'sezon', 'Sezon', 'select', '["Primăvară","Vară","Toamnă","Iarnă","Toate anotimpurile"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, true, true, null, 78, false, false, '{}'::jsonb, true),
('attr-parfumuri-moment_zi', 'moment_zi', 'Moment al zilei', 'select', '["Zi","Seară","Zi și seară"]'::jsonb, 'parfumuri', '["parfumuri"]'::jsonb, false, true, null, 79, false, false, '{}'::jsonb, true),
('attr-ceasuri-material_carcasa', 'material_carcasa', 'Material carcasă', 'select', '["Oțel inoxidabil","Oțel 316L","Alamă","Titan","Aliaj","Ceramică"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, true, true, null, 80, false, false, '{}'::jsonb, true),
('attr-ceasuri-culoare_carcasa', 'culoare_carcasa', 'Culoare', 'select', '["Auriu","Argintiu","Rose Gold","Negru","Alb","Multicolor"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, true, true, null, 81, false, false, '{"Auriu":"#d4af37","Argintiu":"#c0c0c0","Rose Gold":"#b76e79","Negru":"#1c1c1c","Alb":"#f5f5f5","Multicolor":"#9b5de5"}'::jsonb, true),
('attr-ceasuri-diametru_carcasa', 'diametru_carcasa', 'Diametru carcasă', 'number', '[]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, false, true, 'mm', 82, false, false, '{}'::jsonb, true),
('attr-ceasuri-material_curea', 'material_curea', 'Material curea', 'select', '["Oțel","Piele","Silicon","Textil","Mesh","Cauciuc"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, true, true, null, 83, false, false, '{}'::jsonb, true),
('attr-ceasuri-mecanism', 'mecanism', 'Mecanism', 'select', '["Quartz","Automatic","Mecanic","Digital"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, true, true, null, 84, false, false, '{}'::jsonb, true),
('attr-ceasuri-rezistenta_apa', 'rezistenta_apa', 'Rezistență la apă', 'select', '["Fără","3 ATM","5 ATM","10 ATM","20 ATM"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, false, true, null, 85, false, false, '{}'::jsonb, true),
('attr-ceasuri-gen_ceas', 'gen_ceas', 'Gen', 'select', '["Damă","Bărbați","Unisex","Copii"]'::jsonb, 'ceasuri', '["ceasuri"]'::jsonb, true, true, null, 86, false, false, '{}'::jsonb, true)
on conflict (id) do update set
 key = excluded.key, label = excluded.label, type = excluded.type, options = excluded.options,
 department_slug = excluded.department_slug, category_slugs = excluded.category_slugs,
 filterable = excluded.filterable, show_on_product = excluded.show_on_product, unit = excluded.unit,
 position = excluded.position, required = excluded.required, is_variant = excluded.is_variant,
 swatches = excluded.swatches, active = true;