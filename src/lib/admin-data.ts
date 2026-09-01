import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  AttributeValues,
  Discount,
  DiscountTargetType,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductStatus,
  ProductVariant,
} from "@/data/types";

/* ------------------------------------------------------------------ */
/* Mapare rânduri din baza de date → modele folosite în interfață      */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

const num = (v: unknown, fallback = 0) => (v === null || v === undefined ? fallback : Number(v));
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

export function mapProduct(row: Row): Product {
  return {
    id: str(row["id"]),
    slug: str(row["slug"]),
    sku: str(row["sku"]),
    name: str(row["name"]),
    description: str(row["description"]),
    price: num(row["price"]),
    oldPrice: row["old_price"] === null ? null : num(row["old_price"]),
    departmentSlug: str(row["department_slug"]),
    categorySlug: str(row["category_slug"]),
    collectionSlug: (row["collection_slug"] as string | null) ?? null,
    brandSlug: (row["brand_slug"] as string | null) ?? null,
    stock: num(row["stock"]),
    minStock: num(row["min_stock"]),
    images: (row["images"] as string[] | null) ?? [],
    variants: (row["variants"] as ProductVariant[] | null) ?? [],
    attributes: (row["attributes"] as AttributeValues | null) ?? {},
    status: (str(row["status"], "activ") as ProductStatus) ?? "activ",
    isNew: Boolean(row["is_new"]),
    isFeatured: Boolean(row["is_featured"]),
    isBestseller: Boolean(row["is_bestseller"]),
    popularity: num(row["popularity"]),
    createdAt: str(row["created_at"]),
    seoTitle: (row["seo_title"] as string | null) ?? undefined,
    seoDescription: (row["seo_description"] as string | null) ?? undefined,
  };
}

export function productToRow(p: Product): Row {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: p.price,
    old_price: p.oldPrice,
    department_slug: p.departmentSlug,
    category_slug: p.categorySlug,
    collection_slug: p.collectionSlug,
    brand_slug: p.brandSlug,
    stock: p.stock,
    min_stock: p.minStock,
    images: p.images,
    variants: p.variants,
    attributes: p.attributes,
    status: p.status,
    is_new: p.isNew,
    is_featured: p.isFeatured,
    is_bestseller: p.isBestseller,
    popularity: p.popularity,
    created_at: p.createdAt,
    seo_title: p.seoTitle ?? null,
    seo_description: p.seoDescription ?? null,
  };
}

export function mapOrder(row: Row): Order {
  return {
    id: str(row["id"]),
    number: str(row["number"]),
    customerName: str(row["customer_name"]),
    customerEmail: str(row["customer_email"]),
    customerPhone: str(row["customer_phone"]),
    city: str(row["city"]),
    county: str(row["county"]),
    subtotal: num(row["subtotal"]),
    discount: num(row["discount"]),
    shipping: num(row["shipping"]),
    total: num(row["total"]),
    status: str(row["status"], "noua") as OrderStatus,
    awb: (row["awb"] as string | null) ?? null,
    notes: (row["notes"] as string | null) ?? null,
    items: (row["items"] as OrderItem[] | null) ?? [],
    createdAt: str(row["created_at"]),
  };
}

export function mapDiscount(row: Row): Discount {
  return {
    id: str(row["id"]),
    name: str(row["name"]),
    type: str(row["type"], "procent") as Discount["type"],
    value: num(row["value"]),
    targetType: str(row["target_type"], "produs") as DiscountTargetType,
    targetSlug: str(row["target_slug"]),
    startsAt: str(row["starts_at"]),
    endsAt: str(row["ends_at"]),
    active: Boolean(row["active"]),
  };
}

/* ------------------------------------------------------------------ */
/* Hook generic cu actualizare în timp real                            */
/* ------------------------------------------------------------------ */

type TableName = "products" | "orders" | "discounts";

export function useLiveTable<T>(
  table: TableName,
  mapRow: (row: Row) => T,
  orderBy: { column: string; ascending?: boolean },
) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from(table)
      .select("*")
      .order(orderBy.column, { ascending: orderBy.ascending ?? false });
    if (err) setError(err.message);
    else {
      setError(null);
      setRows((data ?? []).map((r) => mapRow(r as Row)));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, orderBy.column, orderBy.ascending]);

  useEffect(() => {
    void load();
    const channel = supabase
      .channel(`admin-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        void load();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, load]);

  return { rows, setRows, loading, error, reload: load };
}

/* ------------------------------------------------------------------ */
/* Operațiuni de scriere                                               */
/* ------------------------------------------------------------------ */

export async function saveProduct(product: Product) {
  const { error } = await supabase.from("products").upsert(productToRow(product) as never);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProductFields(id: string, fields: Row) {
  const { error } = await supabase.from("products").update(fields as never).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status } as never).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateDiscountActive(id: string, active: boolean) {
  const { error } = await supabase.from("discounts").update({ active } as never).eq("id", id);
  if (error) throw new Error(error.message);
}
