import { supabase } from "@/integrations/supabase/client";

export const BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export type ProductImage = {
  id: string | null;
  url: string;
  storagePath: string | null;
  isPrimary: boolean;
};

export function publicPathFor(storagePath: string) {
  return `/api/public/product-image/${storagePath}`;
}

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

/** Validează tipul și dimensiunea fișierului; întoarce mesaj în română sau null. */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Formatul imaginii nu este acceptat. Alege JPG, PNG sau WEBP.";
  if (file.size > MAX_IMAGE_BYTES) return "Imaginea este prea mare. Alege o imagine mai mică de 5 MB.";
  return null;
}

/** Încarcă o imagine în stocare și întoarce calea + URL-ul public. */
export async function uploadProductImage(productId: string, file: File) {
  const message = validateImageFile(file);
  if (message) throw new Error(message);

  const unique =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`) +
    "." +
    extensionFor(file);
  const storagePath = `products/${productId}/${unique}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    if (/row-level security|not authorized|Unauthorized/i.test(error.message)) {
      throw new Error("Nu ai permisiunea de a încărca imagini.");
    }
    throw new Error("Nu am putut încărca imaginea.");
  }

  return { storagePath, url: publicPathFor(storagePath) };
}

/** Șterge fișierele indicate din stocare (ignoră căile lipsă). */
export async function removeStorageFiles(paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => Boolean(p));
  if (list.length === 0) return;
  const { error } = await supabase.storage.from(BUCKET).remove(list);
  if (error) throw new Error("Nu am putut șterge imaginea.");
}

/** Citește imaginile unui produs din baza de date. */
export async function fetchProductImages(productId: string): Promise<ProductImage[]> {
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, storage_path, is_primary, position")
    .eq("product_id", productId)
    .order("position");
  if (error) throw new Error("Nu am putut încărca imaginile produsului.");
  return (data ?? []).map((r) => ({
    id: String(r.id),
    url: String(r.url),
    storagePath: (r.storage_path as string | null) ?? null,
    isPrimary: Boolean(r.is_primary),
  }));
}

/** Șterge toate fișierele din stocare asociate unui produs. */
export async function removeAllProductFiles(productId: string) {
  const { data } = await supabase.storage.from(BUCKET).list(`products/${productId}`);
  const paths = (data ?? []).map((f) => `products/${productId}/${f.name}`);
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
}

/** Încarcă o imagine de catalog (categorie, colecție, brand) și întoarce URL-ul public. */
export async function uploadCatalogImage(kind: "categories" | "collections" | "brands", file: File) {
  const message = validateImageFile(file);
  if (message) throw new Error(message);

  const unique =
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`) +
    "." +
    extensionFor(file);
  const storagePath = `catalog/${kind}/${unique}`;

  const { error } = await supabase.storage.from(BUCKET).upload(storagePath, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) {
    if (/row-level security|not authorized|Unauthorized/i.test(error.message)) {
      throw new Error("Nu ai permisiunea de a încărca imagini.");
    }
    throw new Error("Nu am putut încărca imaginea.");
  }

  return { storagePath, url: publicPathFor(storagePath) };
}
