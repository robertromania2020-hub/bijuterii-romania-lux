/**
 * Modele de date pregătite pentru conectarea la baza de date (faza următoare).
 * Numele câmpurilor reflectă tabelele viitoare: products, categories,
 * collections, product_images, product_variants, inventory, orders,
 * order_items, customers, discounts, coupons, admin_users, wishlists, addresses.
 */

export type Material = "otel" | "aur" | "argint" | "perle";

export const MATERIAL_LABELS: Record<Material, string> = {
  otel: "Oțel inoxidabil",
  aur: "Placat cu aur",
  argint: "Argint 925",
  perle: "Perle",
};

export type StockStatus = "in_stoc" | "stoc_limitat" | "stoc_epuizat";

export const STOCK_LABELS: Record<StockStatus, string> = {
  in_stoc: "În stoc",
  stoc_limitat: "Stoc limitat",
  stoc_epuizat: "Stoc epuizat",
};

export type ProductStatus = "activ" | "inactiv";

export interface Category {
  id: string;
  slug: string;
  name: string;
  image: string;
  productCount: number;
  tone: "lilac" | "mint" | "peach";
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  oldPrice: number | null;
  material: Material;
  categorySlug: string;
  collectionSlug: string | null;
  stock: number;
  minStock: number;
  images: string[];
  variants: string[];
  status: ProductStatus;
  isNew: boolean;
  isFeatured: boolean;
  popularity: number;
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

export interface Discount {
  id: string;
  name: string;
  type: "procent" | "suma_fixa";
  value: number;
  target: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  type: "procent" | "suma_fixa";
  value: number;
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

export function stockStatus(product: Pick<Product, "stock" | "minStock">): StockStatus {
  if (product.stock <= 0) return "stoc_epuizat";
  if (product.stock <= product.minStock) return "stoc_limitat";
  return "in_stoc";
}
