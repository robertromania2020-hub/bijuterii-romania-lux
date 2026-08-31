/**
 * Modele de date generice, pregătite pentru conectarea la baza de date.
 * Numele câmpurilor reflectă tabelele viitoare: departments, categories,
 * brands, products, product_images, product_attributes,
 * product_attribute_values, product_variants, inventory, inventory_history,
 * collections, discounts, coupons, orders, order_items, customers,
 * customer_addresses, wishlists, admin_users.
 *
 * IMPORTANT: niciun produs nu presupune că este bijuterie. Atributele
 * specifice (material, nuanță, gramaj etc.) sunt definite dinamic prin
 * `AttributeDefinition` și stocate în `Product.attributes`.
 */

export type Tone = "lilac" | "mint" | "peach";

export interface Department {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  tone: Tone;
  active: boolean;
  position: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  departmentSlug: string;
  image: string;
  tone: Tone;
  active: boolean;
  position: number;
  seoTitle?: string;
  seoDescription?: string;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  active: boolean;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  departmentSlug: string | null;
}

/** Tipuri de atribute pe care administratorul le poate crea. */
export type AttributeType = "text" | "select" | "multi" | "number" | "boolean";

export const ATTRIBUTE_TYPE_LABELS: Record<AttributeType, string> = {
  text: "Text",
  select: "Selecție unică",
  multi: "Selecție multiplă",
  number: "Număr",
  boolean: "Da / Nu",
};

export interface AttributeDefinition {
  id: string;
  key: string;
  label: string;
  type: AttributeType;
  /** Opțiunile disponibile pentru tipurile select / multi. */
  options: string[];
  /** Departamentul în care se aplică atributul; null = toate departamentele. */
  departmentSlug: string | null;
  /** Categoriile în care se aplică; listă goală = toate categoriile departamentului. */
  categorySlugs: string[];
  /** Apare ca filtru în listare. */
  filterable: boolean;
  /** Apare în fișa produsului. */
  showOnProduct: boolean;
  unit?: string;
  position: number;
}

export type AttributeValue = string | string[] | number | boolean;
export type AttributeValues = Record<string, AttributeValue>;

export interface ProductVariant {
  id: string;
  /** Numele atributului care generează varianta: „Nuanță", „Mărime" etc. */
  attributeLabel: string;
  /** Valoarea variantei, afișată clientului. */
  label: string;
  sku: string;
  /** Preț propriu; null = folosește prețul produsului. */
  price: number | null;
  stock: number;
  image: string | null;
  active: boolean;
}

export type ProductStatus = "activ" | "inactiv";

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  /** Prețul întreg, anterior reducerii. */
  oldPrice: number | null;
  departmentSlug: string;
  categorySlug: string;
  collectionSlug: string | null;
  brandSlug: string | null;
  stock: number;
  minStock: number;
  images: string[];
  variants: ProductVariant[];
  attributes: AttributeValues;
  status: ProductStatus;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  popularity: number;
  createdAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type StockStatus = "in_stoc" | "stoc_limitat" | "stoc_epuizat";

export const STOCK_LABELS: Record<StockStatus, string> = {
  in_stoc: "În stoc",
  stoc_limitat: "Stoc redus",
  stoc_epuizat: "Stoc epuizat",
};

export function stockStatus(product: Pick<Product, "stock" | "minStock">): StockStatus {
  if (product.stock <= 0) return "stoc_epuizat";
  if (product.stock <= product.minStock) return "stoc_limitat";
  return "in_stoc";
}

export interface InventoryEntry {
  id: string;
  productId: string;
  variantId: string | null;
  change: number;
  resulting: number;
  reason: string;
  author: string;
  createdAt: string;
}

export type OrderStatus =
  | "noua"
  | "confirmata"
  | "in_procesare"
  | "expediata"
  | "livrata"
  | "anulata";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  noua: "Nouă",
  confirmata: "Confirmată",
  in_procesare: "În procesare",
  expediata: "Expediată",
  livrata: "Livrată",
  anulata: "Anulată",
};

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  departmentSlug: string;
  variantLabel: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  number: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  county: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  awb: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
}

export type DiscountTargetType = "produs" | "categorie" | "departament" | "colectie";

export const DISCOUNT_TARGET_LABELS: Record<DiscountTargetType, string> = {
  produs: "Produs",
  categorie: "Categorie",
  departament: "Departament",
  colectie: "Colecție",
};

export interface Discount {
  id: string;
  name: string;
  type: "procent" | "suma_fixa";
  value: number;
  targetType: DiscountTargetType;
  /** Slug-ul țintei (produs, categorie, departament sau colecție). */
  targetSlug: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "procent" | "suma_fixa";
  value: number;
  minOrder: number;
  usageLimit: number;
  used: number;
  active: boolean;
  expiresAt: string;
}

export interface Address {
  id: string;
  label: string;
  county: string;
  city: string;
  street: string;
  number: string;
  block?: string;
  entrance?: string;
  apartment?: string;
  postalCode: string;
  isDefault: boolean;
}
