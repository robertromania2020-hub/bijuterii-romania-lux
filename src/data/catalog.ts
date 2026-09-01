/**
 * Catalogul aplicației. Datele NU mai sunt statice: departamentele,
 * categoriile, brandurile, colecțiile, definițiile de atribute și produsele
 * sunt încărcate din baza de date (Lovable Cloud) prin `CatalogProvider`
 * (`src/lib/catalog-live.tsx`), care apelează `hydrateCatalog()`.
 *
 * Tablourile exportate mai jos sunt referințe stabile, actualizate pe loc,
 * astfel încât toate paginile existente continuă să funcționeze.
 */
import type {
  AttributeDefinition,
  AttributeValue,
  Brand,
  Category,
  Collection,
  Coupon,
  Customer,
  Department,
  InventoryEntry,
  Order,
  Product,
} from "./types";

/* ------------------------------------------------------------------ */
/* Date din baza de date (populate la rulare)                          */
/* ------------------------------------------------------------------ */

export const departments: Department[] = [];
export const categories: Category[] = [];
export const brands: Brand[] = [];
export const collections: Collection[] = [];
export const attributeDefinitions: AttributeDefinition[] = [];
export const products: Product[] = [];

export interface CatalogSnapshot {
  departments: Department[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  attributeDefinitions: AttributeDefinition[];
  products: Product[];
}

function replace<T>(target: T[], next: T[]) {
  target.splice(0, target.length, ...next);
}

/** Înlocuiește conținutul catalogului cu datele venite din baza de date. */
export function hydrateCatalog(snapshot: CatalogSnapshot) {
  replace(departments, snapshot.departments);
  replace(categories, snapshot.categories);
  replace(brands, snapshot.brands);
  replace(collections, snapshot.collections);
  replace(attributeDefinitions, snapshot.attributeDefinitions);
  replace(products, snapshot.products);
}

/* ------------------------------------------------------------------ */
/* Selectori                                                           */
/* ------------------------------------------------------------------ */

export function getDepartment(slug: string): Department | undefined {
  return departments.find((d) => d.slug === slug);
}

export function activeDepartments(): Department[] {
  return departments.filter((d) => d.active).sort((a, b) => a.position - b.position);
}

export function categoriesOf(departmentSlug: string): Category[] {
  return categories
    .filter((c) => c.departmentSlug === departmentSlug && c.active)
    .sort((a, b) => a.position - b.position);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getBrand(slug: string | null): Brand | undefined {
  return slug ? brands.find((b) => b.slug === slug) : undefined;
}

export function getCollection(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

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
    const haystack = [p.name, p.sku, p.description, brand, category, department, attrs, variants]
      .join(" ")
      .toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

/* ------------------------------------------------------------------ */
/* Date demonstrative rămase (comenzi client, clienți, stoc, cupoane)  */
/* Vor fi mutate în baza de date într-o etapă ulterioară.              */
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
