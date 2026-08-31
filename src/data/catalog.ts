import type {
  AttributeDefinition,
  AttributeValue,
  Brand,
  Category,
  Collection,
  Coupon,
  Customer,
  Department,
  Discount,
  InventoryEntry,
  Order,
  Product,
} from "./types";

import catInele from "@/assets/cat-inele.jpg";
import catBratari from "@/assets/cat-bratari.jpg";
import catColiere from "@/assets/cat-coliere.jpg";
import catCercei from "@/assets/cat-cercei.jpg";
import pCerceiHuggie from "@/assets/p-cercei-huggie.jpg";
import pColierDelicat from "@/assets/p-colier-delicat.jpg";
import pSetInele from "@/assets/p-set-inele.jpg";
import pBratraOtel from "@/assets/p-bratara-otel.jpg";
import pInelSignet from "@/assets/p-inel-signet.jpg";
import pSetCadou from "@/assets/p-set-cadou.jpg";
import colGold from "@/assets/col-gold.jpg";
import colMinimal from "@/assets/col-minimal.jpg";
import deptBijuterii from "@/assets/dept-bijuterii.jpg";
import deptMachiaj from "@/assets/dept-machiaj.jpg";
import catFondTen from "@/assets/cat-fond-ten.jpg";
import catRujuri from "@/assets/cat-rujuri.jpg";
import catFarduri from "@/assets/cat-farduri.jpg";
import pRujMatte from "@/assets/p-ruj-matte.jpg";
import pMascara from "@/assets/p-mascara.jpg";

/**
 * Date demonstrative. În faza următoare vor fi înlocuite cu interogări
 * către baza de date, păstrând exact aceleași tipuri.
 */

/* ------------------------------------------------------------------ */
/* Departamente                                                        */
/* ------------------------------------------------------------------ */

export const departments: Department[] = [
  {
    id: "d1",
    slug: "bijuterii",
    name: "Bijuterii",
    description:
      "Inele, brățări, coliere și cercei din oțel inoxidabil, argint 925 și piese placate cu aur.",
    image: deptBijuterii,
    tone: "peach",
    active: true,
    position: 1,
    seoTitle: "Bijuterii — inele, brățări, coliere, cercei",
    seoDescription:
      "Bijuterii din oțel inoxidabil și placate cu aur. Filtrează după categorie, material, culoare și preț.",
  },
  {
    id: "d2",
    slug: "machiaj",
    name: "Machiaj",
    description:
      "Fond de ten, farduri, rujuri, mascara și tot ce îți trebuie pentru un machiaj complet.",
    image: deptMachiaj,
    tone: "lilac",
    active: true,
    position: 2,
    seoTitle: "Machiaj — fond de ten, farduri, rujuri, mascara",
    seoDescription:
      "Produse de machiaj de la branduri cunoscute. Filtrează după brand, nuanță, finish și preț.",
  },
];

export function getDepartment(slug: string): Department | undefined {
  return departments.find((d) => d.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Categorii                                                           */
/* ------------------------------------------------------------------ */

const tones = ["lilac", "mint", "peach"] as const;
const tone = (i: number) => tones[i % 3]!;

function makeCategory(
  id: string,
  departmentSlug: string,
  slug: string,
  name: string,
  image: string,
  position: number,
): Category {
  return {
    id,
    slug,
    name,
    departmentSlug,
    image,
    tone: tone(position),
    active: true,
    position,
  };
}

export const categories: Category[] = [
  // Bijuterii
  makeCategory("c1", "bijuterii", "inele", "Inele", catInele, 1),
  makeCategory("c2", "bijuterii", "bratari", "Brățări", catBratari, 2),
  makeCategory("c3", "bijuterii", "coliere", "Coliere", catColiere, 3),
  makeCategory("c4", "bijuterii", "cercei", "Cercei", catCercei, 4),
  makeCategory("c5", "bijuterii", "seturi", "Seturi", pSetCadou, 5),
  makeCategory("c6", "bijuterii", "placate-cu-aur", "Bijuterii placate cu aur", colGold, 6),
  makeCategory("c7", "bijuterii", "otel", "Bijuterii din oțel", colMinimal, 7),
  // Machiaj
  makeCategory("m1", "machiaj", "fond-de-ten", "Fond de ten", catFondTen, 1),
  makeCategory("m2", "machiaj", "pudra", "Pudră", catFondTen, 2),
  makeCategory("m3", "machiaj", "farduri", "Farduri", catFarduri, 3),
  makeCategory("m4", "machiaj", "palete-de-farduri", "Palete de farduri", catFarduri, 4),
  makeCategory("m5", "machiaj", "rujuri", "Rujuri", catRujuri, 5),
  makeCategory("m6", "machiaj", "gloss", "Gloss", catRujuri, 6),
  makeCategory("m7", "machiaj", "mascara", "Mascara", pMascara, 7),
  makeCategory("m8", "machiaj", "eyeliner", "Eyeliner", pMascara, 8),
  makeCategory("m9", "machiaj", "blush", "Blush", catFarduri, 9),
  makeCategory("m10", "machiaj", "bronzer", "Bronzer", catFarduri, 10),
  makeCategory("m11", "machiaj", "contur", "Contur", catFondTen, 11),
  makeCategory("m12", "machiaj", "iluminator", "Iluminator", catFarduri, 12),
  makeCategory("m13", "machiaj", "primer", "Primer", catFondTen, 13),
  makeCategory("m14", "machiaj", "corector", "Corector", catFondTen, 14),
  makeCategory("m15", "machiaj", "creioane-de-buze", "Creioane de buze", catRujuri, 15),
  makeCategory("m16", "machiaj", "creioane-de-ochi", "Creioane de ochi", pMascara, 16),
  makeCategory("m17", "machiaj", "fixator-machiaj", "Fixator machiaj", catFondTen, 17),
];

export function categoriesOf(departmentSlug: string): Category[] {
  return categories
    .filter((c) => c.departmentSlug === departmentSlug && c.active)
    .sort((a, b) => a.position - b.position);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Branduri                                                            */
/* ------------------------------------------------------------------ */

export const brands: Brand[] = [
  { id: "b1", slug: "bijuterii-studio", name: "BIJUTERII Studio", logo: null, active: true },
  { id: "b2", slug: "maybelline", name: "Maybelline", logo: null, active: true },
  { id: "b3", slug: "loreal", name: "L'Oréal", logo: null, active: true },
  { id: "b4", slug: "nyx", name: "NYX", logo: null, active: true },
  { id: "b5", slug: "mac", name: "MAC", logo: null, active: true },
  { id: "b6", slug: "essence", name: "Essence", logo: null, active: true },
];

export function getBrand(slug: string | null): Brand | undefined {
  return slug ? brands.find((b) => b.slug === slug) : undefined;
}

/* ------------------------------------------------------------------ */
/* Definiții de atribute (gestionabile din Administrare)               */
/* ------------------------------------------------------------------ */

export const attributeDefinitions: AttributeDefinition[] = [
  {
    id: "a1",
    key: "material",
    label: "Material",
    type: "select",
    options: ["Oțel inoxidabil", "Placat cu aur", "Argint 925", "Perle"],
    departmentSlug: "bijuterii",
    categorySlugs: [],
    filterable: true,
    showOnProduct: true,
    position: 1,
  },
  {
    id: "a2",
    key: "culoare",
    label: "Culoare",
    type: "select",
    options: ["Auriu", "Argintiu", "Roze", "Negru"],
    departmentSlug: "bijuterii",
    categorySlugs: [],
    filterable: true,
    showOnProduct: true,
    position: 2,
  },
  {
    id: "a3",
    key: "marime",
    label: "Mărime",
    type: "select",
    options: ["16 mm", "17 mm", "18 mm", "19 mm"],
    departmentSlug: "bijuterii",
    categorySlugs: ["inele", "seturi"],
    filterable: true,
    showOnProduct: true,
    position: 3,
  },
  {
    id: "a4",
    key: "dimensiune",
    label: "Dimensiune",
    type: "text",
    options: [],
    departmentSlug: "bijuterii",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 4,
  },
  {
    id: "a5",
    key: "tip_placare",
    label: "Tip placare",
    type: "select",
    options: ["Aur 18K", "Aur 14K", "Rodiu", "Fără placare"],
    departmentSlug: "bijuterii",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 5,
  },
  {
    id: "a6",
    key: "greutate",
    label: "Greutate",
    type: "number",
    options: [],
    unit: "g",
    departmentSlug: "bijuterii",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 6,
  },
  {
    id: "a7",
    key: "nuanta",
    label: "Nuanță",
    type: "select",
    options: ["Nude", "Roz", "Roșu", "Maro", "Bej", "Coral"],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: true,
    showOnProduct: true,
    position: 1,
  },
  {
    id: "a8",
    key: "cod_nuanta",
    label: "Cod nuanță",
    type: "text",
    options: [],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 2,
  },
  {
    id: "a9",
    key: "finish",
    label: "Finish",
    type: "select",
    options: ["Mat", "Satinat", "Lucios", "Shimmer", "Natural"],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: true,
    showOnProduct: true,
    position: 3,
  },
  {
    id: "a10",
    key: "tip_produs",
    label: "Tip produs",
    type: "select",
    options: ["Lichid", "Cremă", "Pudră", "Stick", "Creion"],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: true,
    showOnProduct: true,
    position: 4,
  },
  {
    id: "a11",
    key: "volum",
    label: "Volum",
    type: "text",
    options: [],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 5,
  },
  {
    id: "a12",
    key: "gramaj",
    label: "Gramaj",
    type: "text",
    options: [],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 6,
  },
  {
    id: "a13",
    key: "ingrediente",
    label: "Ingrediente",
    type: "text",
    options: [],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 7,
  },
  {
    id: "a14",
    key: "vegan",
    label: "Formulă vegană",
    type: "boolean",
    options: [],
    departmentSlug: "machiaj",
    categorySlugs: [],
    filterable: false,
    showOnProduct: true,
    position: 8,
  },
];

/** Atributele relevante pentru un departament (și opțional o categorie). */
export function attributesFor(
  departmentSlug: string | null,
  categorySlug?: string | null,
): AttributeDefinition[] {
  return attributeDefinitions
    .filter((a) => a.departmentSlug === null || a.departmentSlug === departmentSlug)
    .filter(
      (a) =>
        a.categorySlugs.length === 0 ||
        !categorySlug ||
        a.categorySlugs.includes(categorySlug),
    )
    .sort((a, b) => a.position - b.position);
}

export function formatAttributeValue(def: AttributeDefinition, value: AttributeValue): string {
  if (typeof value === "boolean") return value ? "Da" : "Nu";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "number") return def.unit ? `${value} ${def.unit}` : String(value);
  return value;
}

/* ------------------------------------------------------------------ */
/* Colecții                                                            */
/* ------------------------------------------------------------------ */

export const collections: Collection[] = [
  {
    id: "k1",
    slug: "gold-collection",
    name: "Gold Collection",
    description: "Piese placate cu aur de 18K, pentru zilele în care vrei să strălucești.",
    image: colGold,
    departmentSlug: "bijuterii",
  },
  {
    id: "k2",
    slug: "stainless-steel",
    name: "Stainless Steel",
    description: "Oțel inoxidabil rezistent la apă, potrivit pentru purtare zilnică.",
    image: colMinimal,
    departmentSlug: "bijuterii",
  },
  {
    id: "k3",
    slug: "minimal",
    name: "Minimal",
    description: "Linii curate și forme discrete, pentru un stil fără efort.",
    image: pColierDelicat,
    departmentSlug: "bijuterii",
  },
  {
    id: "k4",
    slug: "elegance",
    name: "Elegance",
    description: "Bijuterii statement pentru ocazii speciale.",
    image: pInelSignet,
    departmentSlug: "bijuterii",
  },
  {
    id: "k5",
    slug: "cadouri",
    name: "Cadouri",
    description: "Seturi ambalate cadou, gata de dăruit.",
    image: pSetCadou,
    departmentSlug: null,
  },
  {
    id: "k6",
    slug: "nude-essentials",
    name: "Nude Essentials",
    description: "Nuanțe naturale de zi, pentru un machiaj discret și luminos.",
    image: pRujMatte,
    departmentSlug: "machiaj",
  },
  {
    id: "k7",
    slug: "glam-night",
    name: "Glam Night",
    description: "Farduri intense și texturi de lungă durată pentru serile speciale.",
    image: catFarduri,
    departmentSlug: "machiaj",
  },
];

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

/* ------------------------------------------------------------------ */
/* Produse                                                             */
/* ------------------------------------------------------------------ */

export const products: Product[] = [
  {
    id: "p1",
    slug: "cercei-huggie-aur",
    sku: "BJ-CER-001",
    name: "Cercei Huggie placați cu aur",
    description:
      "Cercei huggie cu finisaj lucios, placați cu aur de 18K pe bază de oțel inoxidabil. Ușori, confortabili și potriviți pentru purtare zilnică.",
    price: 189,
    oldPrice: 270,
    departmentSlug: "bijuterii",
    categorySlug: "cercei",
    collectionSlug: "gold-collection",
    brandSlug: "bijuterii-studio",
    stock: 24,
    minStock: 5,
    images: [pCerceiHuggie, catCercei],
    variants: [],
    attributes: {
      material: "Placat cu aur",
      culoare: "Auriu",
      tip_placare: "Aur 18K",
      dimensiune: "12 mm diametru",
      greutate: 2.4,
    },
    status: "activ",
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    popularity: 98,
    createdAt: "2026-05-11",
  },
  {
    id: "p2",
    slug: "colier-delicat-aur",
    sku: "BJ-COL-014",
    name: "Colier delicat placat cu aur",
    description:
      "Colier fin cu zale mici, lungime reglabilă. Se poartă singur sau în combinație cu alte lănțișoare.",
    price: 240,
    oldPrice: null,
    departmentSlug: "bijuterii",
    categorySlug: "coliere",
    collectionSlug: "minimal",
    brandSlug: "bijuterii-studio",
    stock: 22,
    minStock: 5,
    images: [pColierDelicat, catColiere],
    variants: [
      { id: "p2v1", attributeLabel: "Lungime", label: "40 cm", sku: "BJ-COL-014-40", price: null, stock: 8, image: null, active: true },
      { id: "p2v2", attributeLabel: "Lungime", label: "45 cm", sku: "BJ-COL-014-45", price: null, stock: 10, image: null, active: true },
      { id: "p2v3", attributeLabel: "Lungime", label: "50 cm", sku: "BJ-COL-014-50", price: 255, stock: 4, image: null, active: true },
    ],
    attributes: {
      material: "Placat cu aur",
      culoare: "Auriu",
      tip_placare: "Aur 18K",
      greutate: 3.1,
    },
    status: "activ",
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    popularity: 91,
    createdAt: "2026-08-02",
  },
  {
    id: "p3",
    slug: "set-inele-aur",
    sku: "BJ-INE-032",
    name: "Set 3 inele placate cu aur",
    description:
      "Set format din trei inele subțiri care se poartă suprapuse. Rezistente la apă și la zgârieturi.",
    price: 312,
    oldPrice: 390,
    departmentSlug: "bijuterii",
    categorySlug: "seturi",
    collectionSlug: "gold-collection",
    brandSlug: "bijuterii-studio",
    stock: 12,
    minStock: 4,
    images: [pSetInele, catInele],
    variants: [
      { id: "p3v1", attributeLabel: "Mărime", label: "16 mm", sku: "BJ-INE-032-16", price: null, stock: 4, image: null, active: true },
      { id: "p3v2", attributeLabel: "Mărime", label: "17 mm", sku: "BJ-INE-032-17", price: null, stock: 5, image: null, active: true },
      { id: "p3v3", attributeLabel: "Mărime", label: "18 mm", sku: "BJ-INE-032-18", price: null, stock: 3, image: null, active: true },
    ],
    attributes: {
      material: "Placat cu aur",
      culoare: "Auriu",
      marime: "17 mm",
      tip_placare: "Aur 18K",
    },
    status: "activ",
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    popularity: 87,
    createdAt: "2026-04-20",
  },
  {
    id: "p4",
    slug: "bratara-otel-meridian",
    sku: "BJ-BRA-007",
    name: "Brățară Meridian din oțel",
    description:
      "Brățară din bile de oțel inoxidabil, cu închidere reglabilă. Nu se decolorează și nu provoacă alergii.",
    price: 129,
    oldPrice: null,
    departmentSlug: "bijuterii",
    categorySlug: "bratari",
    collectionSlug: "stainless-steel",
    brandSlug: "bijuterii-studio",
    stock: 31,
    minStock: 6,
    images: [pBratraOtel, catBratari],
    variants: [],
    attributes: {
      material: "Oțel inoxidabil",
      culoare: "Argintiu",
      dimensiune: "18 cm reglabilă",
      greutate: 12,
    },
    status: "activ",
    isNew: false,
    isFeatured: true,
    isBestseller: false,
    popularity: 76,
    createdAt: "2026-03-15",
  },
  {
    id: "p5",
    slug: "inel-signet-elegance",
    sku: "BJ-INE-045",
    name: "Inel Signet Elegance",
    description:
      "Inel statement cu piatră centrală și detalii pavé. Perfect pentru evenimente și ocazii speciale.",
    price: 349,
    oldPrice: 499,
    departmentSlug: "bijuterii",
    categorySlug: "inele",
    collectionSlug: "elegance",
    brandSlug: "bijuterii-studio",
    stock: 0,
    minStock: 3,
    images: [pInelSignet, catInele],
    variants: [
      { id: "p5v1", attributeLabel: "Mărime", label: "16 mm", sku: "BJ-INE-045-16", price: null, stock: 0, image: null, active: true },
      { id: "p5v2", attributeLabel: "Mărime", label: "17 mm", sku: "BJ-INE-045-17", price: null, stock: 0, image: null, active: true },
      { id: "p5v3", attributeLabel: "Mărime", label: "18 mm", sku: "BJ-INE-045-18", price: null, stock: 0, image: null, active: true },
    ],
    attributes: {
      material: "Placat cu aur",
      culoare: "Auriu",
      marime: "17 mm",
      tip_placare: "Aur 18K",
    },
    status: "activ",
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    popularity: 82,
    createdAt: "2026-08-19",
  },
  {
    id: "p6",
    slug: "set-cadou-floral",
    sku: "BJ-SET-011",
    name: "Set cadou Floral: colier și cercei",
    description:
      "Set format din colier și cercei asortați, livrat în cutie cadou. Alegerea potrivită pentru un cadou memorabil.",
    price: 279,
    oldPrice: 349,
    departmentSlug: "bijuterii",
    categorySlug: "seturi",
    collectionSlug: "cadouri",
    brandSlug: "bijuterii-studio",
    stock: 9,
    minStock: 4,
    images: [pSetCadou, colGold],
    variants: [],
    attributes: { material: "Argint 925", culoare: "Argintiu", greutate: 8.5 },
    status: "activ",
    isNew: true,
    isFeatured: false,
    isBestseller: false,
    popularity: 69,
    createdAt: "2026-08-25",
  },
  {
    id: "p7",
    slug: "colier-perla-luna",
    sku: "BJ-COL-022",
    name: "Colier cu perlă Luna",
    description:
      "Colier cu pandantiv rotund și perlă naturală de apă dulce, montată pe lănțișor placat cu aur.",
    price: 219,
    oldPrice: null,
    departmentSlug: "bijuterii",
    categorySlug: "coliere",
    collectionSlug: "elegance",
    brandSlug: "bijuterii-studio",
    stock: 17,
    minStock: 5,
    images: [catColiere, pColierDelicat],
    variants: [
      { id: "p7v1", attributeLabel: "Lungime", label: "42 cm", sku: "BJ-COL-022-42", price: null, stock: 9, image: null, active: true },
      { id: "p7v2", attributeLabel: "Lungime", label: "45 cm", sku: "BJ-COL-022-45", price: null, stock: 8, image: null, active: true },
    ],
    attributes: { material: "Perle", culoare: "Auriu", tip_placare: "Aur 14K" },
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    popularity: 64,
    createdAt: "2026-02-10",
  },
  {
    id: "p8",
    slug: "cercei-cerc-otel",
    sku: "BJ-CER-018",
    name: "Cercei cerc din oțel",
    description:
      "Cercei tip cerc, din oțel inoxidabil lustruit. Rezistenți la apă, potriviți pentru purtare zilnică.",
    price: 99,
    oldPrice: 139,
    departmentSlug: "bijuterii",
    categorySlug: "cercei",
    collectionSlug: "stainless-steel",
    brandSlug: "bijuterii-studio",
    stock: 2,
    minStock: 5,
    images: [catCercei, pCerceiHuggie],
    variants: [],
    attributes: { material: "Oțel inoxidabil", culoare: "Argintiu", dimensiune: "30 mm" },
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    popularity: 58,
    createdAt: "2026-06-30",
  },

  /* ----------------------------- Machiaj ----------------------------- */
  {
    id: "m1",
    slug: "ruj-matte-velvet",
    sku: "MK-RUJ-101",
    name: "Ruj mat Velvet Touch",
    description:
      "Ruj cu textură mată, catifelată, care nu usucă buzele. Rezistență până la 8 ore și acoperire intensă dintr-o singură aplicare.",
    price: 79,
    oldPrice: 99,
    departmentSlug: "machiaj",
    categorySlug: "rujuri",
    collectionSlug: "nude-essentials",
    brandSlug: "maybelline",
    stock: 46,
    minStock: 10,
    images: [pRujMatte, catRujuri],
    variants: [
      { id: "m1v1", attributeLabel: "Nuanță", label: "Nude 01", sku: "MK-RUJ-101-N01", price: null, stock: 18, image: null, active: true },
      { id: "m1v2", attributeLabel: "Nuanță", label: "Rose 02", sku: "MK-RUJ-101-R02", price: null, stock: 16, image: null, active: true },
      { id: "m1v3", attributeLabel: "Nuanță", label: "Red 03", sku: "MK-RUJ-101-R03", price: 85, stock: 12, image: null, active: true },
    ],
    attributes: {
      nuanta: "Nude",
      cod_nuanta: "01",
      finish: "Mat",
      tip_produs: "Stick",
      gramaj: "3,8 g",
      ingrediente: "Ulei de jojoba, vitamina E, ceară de carnauba",
      vegan: true,
    },
    status: "activ",
    isNew: true,
    isFeatured: true,
    isBestseller: true,
    popularity: 96,
    createdAt: "2026-08-18",
  },
  {
    id: "m2",
    slug: "fond-de-ten-luminos",
    sku: "MK-FDT-204",
    name: "Fond de ten luminos 24h",
    description:
      "Fond de ten fluid cu acoperire medie, buildabilă, și finish natural luminos. Rezistă 24 de ore fără să încarce tenul.",
    price: 119,
    oldPrice: null,
    departmentSlug: "machiaj",
    categorySlug: "fond-de-ten",
    collectionSlug: null,
    brandSlug: "loreal",
    stock: 33,
    minStock: 8,
    images: [catFondTen],
    variants: [
      { id: "m2v1", attributeLabel: "Nuanță", label: "Ivory 10", sku: "MK-FDT-204-10", price: null, stock: 11, image: null, active: true },
      { id: "m2v2", attributeLabel: "Nuanță", label: "Beige 20", sku: "MK-FDT-204-20", price: null, stock: 14, image: null, active: true },
      { id: "m2v3", attributeLabel: "Nuanță", label: "Sand 30", sku: "MK-FDT-204-30", price: null, stock: 8, image: null, active: true },
    ],
    attributes: {
      nuanta: "Bej",
      cod_nuanta: "20",
      finish: "Natural",
      tip_produs: "Lichid",
      volum: "30 ml",
      ingrediente: "Acid hialuronic, filtru SPF 20",
    },
    status: "activ",
    isNew: true,
    isFeatured: true,
    isBestseller: true,
    popularity: 94,
    createdAt: "2026-08-12",
  },
  {
    id: "m3",
    slug: "paleta-farduri-warm",
    sku: "MK-PAL-311",
    name: "Paletă farduri Warm Nudes",
    description:
      "Paletă cu 12 nuanțe calde, mate și shimmer, foarte pigmentate și ușor de estompat. Include oglindă.",
    price: 149,
    oldPrice: 189,
    departmentSlug: "machiaj",
    categorySlug: "palete-de-farduri",
    collectionSlug: "glam-night",
    brandSlug: "nyx",
    stock: 21,
    minStock: 6,
    images: [catFarduri, deptMachiaj],
    variants: [],
    attributes: {
      nuanta: "Maro",
      finish: "Shimmer",
      tip_produs: "Pudră",
      gramaj: "14 g",
      vegan: true,
    },
    status: "activ",
    isNew: false,
    isFeatured: true,
    isBestseller: true,
    popularity: 92,
    createdAt: "2026-06-05",
  },
  {
    id: "m4",
    slug: "mascara-volum-extrem",
    sku: "MK-MAS-402",
    name: "Mascara Volum Extrem",
    description:
      "Mascara cu perie din fibre fine care separă genele și adaugă volum instant, fără aglomerări.",
    price: 69,
    oldPrice: null,
    departmentSlug: "machiaj",
    categorySlug: "mascara",
    collectionSlug: null,
    brandSlug: "maybelline",
    stock: 8,
    minStock: 10,
    images: [pMascara],
    variants: [
      { id: "m4v1", attributeLabel: "Nuanță", label: "Negru intens", sku: "MK-MAS-402-BK", price: null, stock: 6, image: null, active: true },
      { id: "m4v2", attributeLabel: "Nuanță", label: "Maro", sku: "MK-MAS-402-BR", price: null, stock: 2, image: null, active: true },
    ],
    attributes: {
      nuanta: "Maro",
      finish: "Mat",
      tip_produs: "Lichid",
      volum: "9,5 ml",
    },
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: true,
    popularity: 88,
    createdAt: "2026-05-02",
  },
  {
    id: "m5",
    slug: "gloss-hidratant-shine",
    sku: "MK-GLO-505",
    name: "Gloss hidratant Shine",
    description:
      "Luciu de buze cu efect de volum, textură non-lipicioasă și finisaj oglindă. Se poate purta singur sau peste ruj.",
    price: 49,
    oldPrice: 65,
    departmentSlug: "machiaj",
    categorySlug: "gloss",
    collectionSlug: "nude-essentials",
    brandSlug: "essence",
    stock: 54,
    minStock: 12,
    images: [catRujuri],
    variants: [
      { id: "m5v1", attributeLabel: "Nuanță", label: "Transparent", sku: "MK-GLO-505-CL", price: null, stock: 24, image: null, active: true },
      { id: "m5v2", attributeLabel: "Nuanță", label: "Roz cald", sku: "MK-GLO-505-PK", price: null, stock: 30, image: null, active: true },
    ],
    attributes: {
      nuanta: "Roz",
      finish: "Lucios",
      tip_produs: "Lichid",
      volum: "6 ml",
      vegan: true,
    },
    status: "activ",
    isNew: true,
    isFeatured: true,
    isBestseller: false,
    popularity: 81,
    createdAt: "2026-08-22",
  },
  {
    id: "m6",
    slug: "blush-cremos-peach",
    sku: "MK-BLU-601",
    name: "Blush cremos Peach Glow",
    description:
      "Blush cu textură cremoasă care se topește pe piele și lasă un efect natural, sănătos.",
    price: 59,
    oldPrice: null,
    departmentSlug: "machiaj",
    categorySlug: "blush",
    collectionSlug: null,
    brandSlug: "mac",
    stock: 3,
    minStock: 6,
    images: [catFarduri],
    variants: [],
    attributes: {
      nuanta: "Coral",
      cod_nuanta: "04",
      finish: "Satinat",
      tip_produs: "Cremă",
      gramaj: "5 g",
    },
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    popularity: 74,
    createdAt: "2026-04-11",
  },
  {
    id: "m7",
    slug: "iluminator-lichid-glow",
    sku: "MK-ILU-707",
    name: "Iluminator lichid Liquid Glow",
    description:
      "Iluminator lichid cu particule fine care dau un aspect luminos, natural. Se aplică singur sau amestecat în fondul de ten.",
    price: 89,
    oldPrice: 109,
    departmentSlug: "machiaj",
    categorySlug: "iluminator",
    collectionSlug: "glam-night",
    brandSlug: "nyx",
    stock: 0,
    minStock: 5,
    images: [catFarduri, deptMachiaj],
    variants: [],
    attributes: {
      nuanta: "Bej",
      finish: "Shimmer",
      tip_produs: "Lichid",
      volum: "15 ml",
      vegan: true,
    },
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: false,
    popularity: 70,
    createdAt: "2026-03-28",
  },
  {
    id: "m8",
    slug: "fixator-machiaj-longlast",
    sku: "MK-FIX-808",
    name: "Fixator machiaj Long Last",
    description:
      "Spray fixator care menține machiajul intact până la 16 ore și reduce aspectul lucios.",
    price: 75,
    oldPrice: null,
    departmentSlug: "machiaj",
    categorySlug: "fixator-machiaj",
    collectionSlug: null,
    brandSlug: "loreal",
    stock: 27,
    minStock: 8,
    images: [catFondTen],
    variants: [],
    attributes: {
      finish: "Mat",
      tip_produs: "Lichid",
      volum: "100 ml",
      ingrediente: "Apă termală, glicerină",
      vegan: true,
    },
    status: "activ",
    isNew: true,
    isFeatured: false,
    isBestseller: false,
    popularity: 66,
    createdAt: "2026-08-27",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function activeProducts(): Product[] {
  return products.filter((p) => p.status === "activ");
}

/** Prețul efectiv al unui produs, ținând cont de varianta selectată. */
export function variantPrice(product: Product, variantLabel: string | null): number {
  const variant = product.variants.find((v) => v.label === variantLabel);
  return variant?.price ?? product.price;
}

/** Stocul disponibil pentru produs sau pentru varianta selectată. */
export function availableStock(product: Product, variantLabel?: string | null): number {
  if (variantLabel) {
    const variant = product.variants.find((v) => v.label === variantLabel);
    if (variant) return variant.stock;
  }
  if (product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + v.stock, 0);
  }
  return product.stock;
}

/**
 * Căutare generică: nume, SKU (inclusiv al variantelor), brand, categorie,
 * departament, descriere și valorile atributelor.
 */
export function searchProducts(term: string, list: Product[] = activeProducts()): Product[] {
  const q = term.trim().toLowerCase();
  if (!q) return list;
  const words = q.split(/\s+/);

  return list.filter((p) => {
    const brand = getBrand(p.brandSlug)?.name ?? "";
    const category = getCategory(p.categorySlug)?.name ?? "";
    const department = getDepartment(p.departmentSlug)?.name ?? "";
    const attrs = Object.values(p.attributes)
      .map((v) => (Array.isArray(v) ? v.join(" ") : String(v)))
      .join(" ");
    const variants = p.variants.map((v) => `${v.label} ${v.sku}`).join(" ");
    const haystack = [
      p.name,
      p.sku,
      p.description,
      brand,
      category,
      department,
      attrs,
      variants,
    ]
      .join(" ")
      .toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

/* ------------------------------------------------------------------ */
/* Comenzi, clienți, stoc, reduceri, cupoane                           */
/* ------------------------------------------------------------------ */

export const orders: Order[] = [
  {
    id: "o1",
    number: "#10025",
    customerName: "Ioana Popescu",
    customerEmail: "ioana.popescu@example.ro",
    customerPhone: "0745 123 456",
    city: "Cluj-Napoca",
    county: "Cluj",
    subtotal: 417,
    discount: 0,
    shipping: 0,
    total: 417,
    status: "noua",
    awb: null,
    notes: null,
    items: [
      {
        productId: "p2",
        name: "Colier delicat placat cu aur",
        sku: "BJ-COL-014-45",
        departmentSlug: "bijuterii",
        variantLabel: "45 cm",
        quantity: 1,
        price: 240,
      },
      {
        productId: "m1",
        name: "Ruj mat Velvet Touch",
        sku: "MK-RUJ-101-N01",
        departmentSlug: "machiaj",
        variantLabel: "Nude 01",
        quantity: 1,
        price: 79,
      },
      {
        productId: "m5",
        name: "Gloss hidratant Shine",
        sku: "MK-GLO-505-PK",
        departmentSlug: "machiaj",
        variantLabel: "Roz cald",
        quantity: 2,
        price: 49,
      },
    ],
    createdAt: "2026-08-29",
  },
  {
    id: "o2",
    number: "#10024",
    customerName: "Andreea Marin",
    customerEmail: "andreea.marin@example.ro",
    customerPhone: "0722 987 654",
    city: "București",
    county: "București",
    subtotal: 461,
    discount: 46.1,
    shipping: 0,
    total: 414.9,
    status: "in_procesare",
    awb: null,
    notes: "Ambalare cadou",
    items: [
      {
        productId: "p3",
        name: "Set 3 inele placate cu aur",
        sku: "BJ-INE-032-17",
        departmentSlug: "bijuterii",
        variantLabel: "17 mm",
        quantity: 1,
        price: 312,
      },
      {
        productId: "m3",
        name: "Paletă farduri Warm Nudes",
        sku: "MK-PAL-311",
        departmentSlug: "machiaj",
        variantLabel: null,
        quantity: 1,
        price: 149,
      },
    ],
    createdAt: "2026-08-28",
  },
  {
    id: "o3",
    number: "#10023",
    customerName: "Maria Ionescu",
    customerEmail: "maria.ionescu@example.ro",
    customerPhone: "0733 555 111",
    city: "Iași",
    county: "Iași",
    subtotal: 198,
    discount: 0,
    shipping: 19.99,
    total: 217.99,
    status: "expediata",
    awb: "SM12345678RO",
    notes: null,
    items: [
      {
        productId: "p4",
        name: "Brățară Meridian din oțel",
        sku: "BJ-BRA-007",
        departmentSlug: "bijuterii",
        variantLabel: null,
        quantity: 1,
        price: 129,
      },
      {
        productId: "m4",
        name: "Mascara Volum Extrem",
        sku: "MK-MAS-402-BK",
        departmentSlug: "machiaj",
        variantLabel: "Negru intens",
        quantity: 1,
        price: 69,
      },
    ],
    createdAt: "2026-08-26",
  },
  {
    id: "o4",
    number: "#10022",
    customerName: "Elena Dobre",
    customerEmail: "elena.dobre@example.ro",
    customerPhone: "0766 222 333",
    city: "Timișoara",
    county: "Timiș",
    subtotal: 558,
    discount: 0,
    shipping: 0,
    total: 558,
    status: "livrata",
    awb: "SM12345611RO",
    notes: null,
    items: [
      {
        productId: "p6",
        name: "Set cadou Floral: colier și cercei",
        sku: "BJ-SET-011",
        departmentSlug: "bijuterii",
        variantLabel: null,
        quantity: 2,
        price: 279,
      },
    ],
    createdAt: "2026-08-21",
  },
];

export const customers: Customer[] = [
  {
    id: "cu1",
    name: "Ioana Popescu",
    email: "ioana.popescu@example.ro",
    phone: "0745 123 456",
    ordersCount: 4,
    totalSpent: 1420,
    createdAt: "2026-01-14",
  },
  {
    id: "cu2",
    name: "Andreea Marin",
    email: "andreea.marin@example.ro",
    phone: "0722 987 654",
    ordersCount: 2,
    totalSpent: 640,
    createdAt: "2026-03-02",
  },
  {
    id: "cu3",
    name: "Maria Ionescu",
    email: "maria.ionescu@example.ro",
    phone: "0733 555 111",
    ordersCount: 1,
    totalSpent: 218,
    createdAt: "2026-07-19",
  },
];

export const inventoryHistory: InventoryEntry[] = [
  {
    id: "ih1",
    productId: "m4",
    variantId: "m4v2",
    change: -4,
    resulting: 2,
    reason: "Comenzi online",
    author: "Sistem",
    createdAt: "2026-08-29",
  },
  {
    id: "ih2",
    productId: "p8",
    variantId: null,
    change: -3,
    resulting: 2,
    reason: "Comenzi online",
    author: "Sistem",
    createdAt: "2026-08-28",
  },
  {
    id: "ih3",
    productId: "m3",
    variantId: null,
    change: 20,
    resulting: 21,
    reason: "Recepție marfă",
    author: "Administrator",
    createdAt: "2026-08-24",
  },
];

export const discounts: Discount[] = [
  {
    id: "d1",
    name: "Reducere vară — placate cu aur",
    type: "procent",
    value: 30,
    targetType: "categorie",
    targetSlug: "placate-cu-aur",
    startsAt: "2026-08-01",
    endsAt: "2026-09-15",
    active: true,
  },
  {
    id: "d2",
    name: "Weekend Beauty",
    type: "procent",
    value: 20,
    targetType: "departament",
    targetSlug: "machiaj",
    startsAt: "2026-09-01",
    endsAt: "2026-09-03",
    active: true,
  },
  {
    id: "d3",
    name: "Colecția Elegance",
    type: "procent",
    value: 20,
    targetType: "colectie",
    targetSlug: "elegance",
    startsAt: "2026-08-10",
    endsAt: "2026-09-30",
    active: true,
  },
  {
    id: "d4",
    name: "Lichidare stoc cercei",
    type: "suma_fixa",
    value: 40,
    targetType: "produs",
    targetSlug: "cercei-cerc-otel",
    startsAt: "2026-07-01",
    endsAt: "2026-07-31",
    active: false,
  },
];

export const coupons: Coupon[] = [
  {
    id: "cp1",
    code: "BINEVENIT10",
    type: "procent",
    value: 10,
    minOrder: 150,
    usageLimit: 500,
    used: 213,
    active: true,
    expiresAt: "2026-12-31",
  },
  {
    id: "cp2",
    code: "TRANSPORTGRATIS",
    type: "suma_fixa",
    value: 20,
    minOrder: 100,
    usageLimit: 200,
    used: 187,
    active: true,
    expiresAt: "2026-10-01",
  },
  {
    id: "cp3",
    code: "BEAUTY25",
    type: "procent",
    value: 25,
    minOrder: 250,
    usageLimit: 100,
    used: 0,
    active: false,
    expiresAt: "2026-11-30",
  },
];

/** Validare cupon — logica va fi mutată pe server la conectarea bazei de date. */
export function validateCoupon(
  code: string,
  subtotal: number,
): { ok: true; coupon: Coupon; discount: number } | { ok: false; message: string } {
  const coupon = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) return { ok: false, message: "Codul introdus nu există." };
  if (!coupon.active) return { ok: false, message: "Codul nu mai este activ." };
  if (coupon.used >= coupon.usageLimit)
    return { ok: false, message: "Codul a atins limita de utilizări." };
  if (new Date(coupon.expiresAt) < new Date())
    return { ok: false, message: "Codul a expirat." };
  if (subtotal < coupon.minOrder)
    return {
      ok: false,
      message: `Codul se aplică la comenzi de minimum ${coupon.minOrder} lei.`,
    };
  const discount =
    coupon.type === "procent" ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal);
  return { ok: true, coupon, discount };
}
