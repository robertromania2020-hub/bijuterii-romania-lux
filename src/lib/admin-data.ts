import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { removeAllProductFiles, type ProductImage } from "@/lib/product-images";
import type {
  AttributeDefinition,
  AttributeType,
  AttributeValue,
  AttributeValues,
  Brand,
  Category,
  Collection,
  Department,
  Discount,
  DiscountTargetType,
  Order,
  OrderItem,
  OrderStatus,
  Product,
  ProductStatus,
  ProductVariant,
  Tone,
} from "@/data/types";

/* ------------------------------------------------------------------ */
/* Mapare rânduri din baza de date → modele folosite în interfață      */
/* ------------------------------------------------------------------ */

export type Row = Record<string, unknown>;

const num = (v: unknown, fallback = 0) => (v === null || v === undefined ? fallback : Number(v));
const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback);

/** Selectul complet pentru produs, incluzând tabelele normalizate. */
export const PRODUCT_SELECT =
  "*, product_images(*), product_variants(*), product_attribute_values(*)";

const rows = (v: unknown): Row[] => (Array.isArray(v) ? (v as Row[]) : []);

export function mapDepartment(row: Row): Department {
  return {
    id: str(row["id"]),
    slug: str(row["slug"]),
    name: str(row["name"]),
    description: str(row["description"]),
    image: str(row["image"]),
    tone: str(row["tone"], "lilac") as Tone,
    active: Boolean(row["active"]),
    position: num(row["position"]),
    ...(row["seo_title"] ? { seoTitle: str(row["seo_title"]) } : {}),
    ...(row["seo_description"] ? { seoDescription: str(row["seo_description"]) } : {}),
  };
}

export function mapCategory(row: Row): Category {
  return {
    id: str(row["id"]),
    slug: str(row["slug"]),
    name: str(row["name"]),
    departmentSlug: str(row["department_slug"]),
    image: str(row["image"]),
    tone: str(row["tone"], "lilac") as Tone,
    active: Boolean(row["active"]),
    position: num(row["position"]),
    ...(row["seo_title"] ? { seoTitle: str(row["seo_title"]) } : {}),
    ...(row["seo_description"] ? { seoDescription: str(row["seo_description"]) } : {}),
  };
}

export function mapBrand(row: Row): Brand {
  return {
    id: str(row["id"]),
    slug: str(row["slug"]),
    name: str(row["name"]),
    logo: (row["logo"] as string | null) ?? null,
    active: Boolean(row["active"]),
  };
}

export function mapCollection(row: Row): Collection {
  return {
    id: str(row["id"]),
    slug: str(row["slug"]),
    name: str(row["name"]),
    description: str(row["description"]),
    image: str(row["image"]),
    departmentSlug: (row["department_slug"] as string | null) ?? null,
  };
}

export function mapAttributeDefinition(row: Row): AttributeDefinition {
  return {
    id: str(row["id"]),
    key: str(row["key"]),
    label: str(row["label"]),
    type: str(row["type"], "text") as AttributeType,
    options: (row["options"] as string[] | null) ?? [],
    departmentSlug: (row["department_slug"] as string | null) ?? null,
    categorySlugs: (row["category_slugs"] as string[] | null) ?? [],
    filterable: Boolean(row["filterable"]),
    showOnProduct: Boolean(row["show_on_product"]),
    ...(row["unit"] ? { unit: str(row["unit"]) } : {}),
    position: num(row["position"]),
  };
}

function mapVariant(row: Row): ProductVariant {
  return {
    id: str(row["id"]),
    attributeLabel: str(row["attribute_label"]),
    label: str(row["label"]),
    sku: str(row["sku"]),
    price: row["price"] === null || row["price"] === undefined ? null : num(row["price"]),
    stock: num(row["stock"]),
    image: (row["image"] as string | null) ?? null,
    active: Boolean(row["active"]),
  };
}

export function mapProduct(row: Row): Product {
  const images = rows(row["product_images"])
    .slice()
    .sort((a, b) => num(a["position"]) - num(b["position"]))
    .map((r) => str(r["url"]))
    .filter(Boolean);

  const variants = rows(row["product_variants"])
    .slice()
    .sort((a, b) => num(a["position"]) - num(b["position"]))
    .map(mapVariant);

  const attributes: AttributeValues = {};
  for (const r of rows(row["product_attribute_values"])) {
    const key = str(r["attribute_key"]);
    if (key) attributes[key] = r["value"] as AttributeValue;
  }

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
    images,
    variants,
    attributes,
    status: (str(row["status"], "activ") as ProductStatus) ?? "activ",
    isNew: Boolean(row["is_new"]),
    isFeatured: Boolean(row["is_featured"]),
    isBestseller: Boolean(row["is_bestseller"]),
    popularity: num(row["popularity"]),
    createdAt: str(row["created_at"]),
    ...(row["seo_title"] ? { seoTitle: str(row["seo_title"]) } : {}),
    ...(row["seo_description"] ? { seoDescription: str(row["seo_description"]) } : {}),
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

export type TableName =
  | "products"
  | "orders"
  | "discounts"
  | "departments"
  | "categories"
  | "brands"
  | "collections"
  | "attribute_definitions";

const CHILD_TABLES = ["product_images", "product_variants", "product_attribute_values"] as const;

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
      .select((table === "products" ? PRODUCT_SELECT : "*") as "*")
      .order(orderBy.column, { ascending: orderBy.ascending ?? false });
    if (err) setError(err.message);
    else {
      setError(null);
      setRows(((data ?? []) as unknown as Row[]).map((r) => mapRow(r)));
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
      });
    if (table === "products") {
      for (const child of CHILD_TABLES) {
        channel.on(
          "postgres_changes",
          { event: "*", schema: "public", table: child },
          () => void load(),
        );
      }
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [table, load]);

  return { rows, setRows, loading, error, reload: load };
}

/* ------------------------------------------------------------------ */
/* Operațiuni de scriere                                               */
/* ------------------------------------------------------------------ */

export async function saveProduct(product: Product, images?: ProductImage[]) {
  const { error } = await supabase.from("products").upsert(productToRow(product) as never);
  if (error) throw new Error(error.message);
  await saveProductImages(product, images);
  await saveProductVariants(product);
  await saveProductAttributes(product);
}

async function saveProductImages(product: Product, images?: ProductImage[]) {
  const list: ProductImage[] =
    images ??
    product.images.map((url, index) => ({
      id: null,
      url,
      storagePath: null,
      isPrimary: index === 0,
    }));

  const del = await supabase.from("product_images").delete().eq("product_id", product.id);
  if (del.error) throw new Error(del.error.message);
  if (list.length === 0) return;
  const primaryIndex = Math.max(0, list.findIndex((i) => i.isPrimary));
  const payload = list.map((img, index) => ({
    product_id: product.id,
    url: img.url,
    storage_path: img.storagePath,
    alt: product.name,
    position: index,
    is_primary: index === primaryIndex,
  }));
  const { error: insErr } = await supabase.from("product_images").insert(payload as never);
  if (insErr) throw new Error(insErr.message);
}

async function saveProductVariants(product: Product) {
  const del = await supabase.from("product_variants").delete().eq("product_id", product.id);
  if (del.error) throw new Error(del.error.message);
  if (product.variants.length === 0) return;
  const payload = product.variants.map((v, index) => ({
    id: v.id,
    product_id: product.id,
    attribute_label: v.attributeLabel,
    label: v.label,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    image: v.image,
    active: v.active,
    position: index,
  }));
  const { error } = await supabase.from("product_variants").insert(payload as never);
  if (error) throw new Error(error.message);
}

async function saveProductAttributes(product: Product) {
  const del = await supabase
    .from("product_attribute_values")
    .delete()
    .eq("product_id", product.id);
  if (del.error) throw new Error(del.error.message);
  const entries = Object.entries(product.attributes);
  if (entries.length === 0) return;
  const payload = entries.map(([attribute_key, value]) => ({
    product_id: product.id,
    attribute_key,
    value,
  }));
  const { error } = await supabase.from("product_attribute_values").insert(payload as never);
  if (error) throw new Error(error.message);
}

/* ------------------------------------------------------------------ */
/* CRUD pentru metadatele catalogului                                  */
/* ------------------------------------------------------------------ */

export async function upsertRow(table: TableName, row: Row) {
  const { error } = await supabase.from(table).upsert(row as never);
  if (error) throw new Error(error.message);
}

export async function updateRow(table: TableName, id: string, fields: Row) {
  const { error } = await supabase.from(table).update(fields as never).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteRow(table: TableName, id: string) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteProduct(id: string) {
  await removeAllProductFiles(id).catch(() => undefined);
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateProductFields(id: string, fields: Row) {
  const { error } = await supabase.from("products").update(fields as never).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.rpc("set_order_status", {
    p_order_id: id,
    p_status: status,
  });
  if (error) throw new Error(error.message);
}

export const setOrderStatus = updateOrderStatus;

export async function updateOrderFields(id: string, fields: Row) {
  const { error } = await supabase.from("orders").update(fields as never).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Setează stocul absolut pentru un produs sau o variantă, cu istoric. */
export async function adjustStock(
  productId: string,
  variantId: string | null,
  newQuantity: number,
  reason = "Ajustare manuală",
) {
  const { error } = await supabase.rpc("adjust_stock", {
    p_product_id: productId,
    p_variant_id: variantId as string,
    p_new_quantity: newQuantity,
    p_reason: reason,
  });
  if (error) throw new Error(error.message);
}


export async function updateDiscountActive(id: string, active: boolean) {
  const { error } = await supabase.from("discounts").update({ active } as never).eq("id", id);
  if (error) throw new Error(error.message);
}

/** Slug simplu, fără diacritice. */
export function slugify(value: string, separator = "-"): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
}
