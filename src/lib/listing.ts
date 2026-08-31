import {
  activeProducts,
  attributesFor,
  availableStock,
  searchProducts,
} from "@/data/catalog";
import type { Product } from "@/data/types";

export type Sortare = "recomandate" | "noi" | "pret_asc" | "pret_desc" | "populare";

export const SORT_LABELS: Record<Sortare, string> = {
  recomandate: "Recomandate",
  noi: "Cele mai noi",
  pret_asc: "Preț: crescător",
  pret_desc: "Preț: descrescător",
  populare: "Cele mai populare",
};

export interface ListingSearch {
  q?: string | undefined;
  categorie?: string | undefined;
  brand?: string | undefined;
  pretMin?: number | undefined;
  pretMax?: number | undefined;
  disponibil?: boolean | undefined;
  reduceri?: boolean | undefined;
  sortare?: Sortare | undefined;
  /** Filtre pe atribute, codificate: `material:Perle|finish:Mat`. */
  filtre?: string | undefined;
}

const SORT_KEYS = ["recomandate", "noi", "pret_asc", "pret_desc", "populare"] as const;

export function validateListingSearch(search: Record<string, unknown>): ListingSearch {
  const str = (k: string) =>
    typeof search[k] === "string" && search[k] ? (search[k] as string) : undefined;
  const num = (k: string) => {
    const v = search[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v !== "" && Number.isFinite(Number(v))) return Number(v);
    return undefined;
  };
  return {
    q: str("q"),
    categorie: str("categorie"),
    brand: str("brand"),
    pretMin: num("pretMin"),
    pretMax: num("pretMax"),
    disponibil: search['disponibil'] === true || search['disponibil'] === "true" ? true : undefined,
    reduceri: search['reduceri'] === true || search['reduceri'] === "true" ? true : undefined,
    sortare: SORT_KEYS.includes(search['sortare'] as Sortare)
      ? (search['sortare'] as Sortare)
      : undefined,
    filtre: str("filtre"),
  };
}

export type AttributeFilters = Record<string, string[]>;

export function parseFiltre(value: string | undefined): AttributeFilters {
  if (!value) return {};
  const out: AttributeFilters = {};
  for (const part of value.split("|")) {
    const idx = part.indexOf(":");
    if (idx <= 0) continue;
    const key = part.slice(0, idx);
    const val = part.slice(idx + 1);
    if (!val) continue;
    (out[key] ??= []).push(val);
  }
  return out;
}

export function stringifyFiltre(filters: AttributeFilters): string | undefined {
  const parts = Object.entries(filters).flatMap(([key, values]) =>
    values.map((v) => `${key}:${v}`),
  );
  return parts.length ? parts.join("|") : undefined;
}

function attributeMatches(product: Product, key: string, values: string[]): boolean {
  const raw = product.attributes[key];
  if (raw === undefined) return false;
  const asList = Array.isArray(raw) ? raw.map(String) : [String(raw)];
  return values.some((v) => asList.includes(v));
}

export interface FilterProductsOptions {
  departmentSlug?: string | null;
  collectionSlug?: string | null;
  source?: Product[];
}

export function filterProducts(
  search: ListingSearch,
  options: FilterProductsOptions = {},
): Product[] {
  let list = options.source ?? activeProducts();

  if (options.departmentSlug) {
    list = list.filter((p) => p.departmentSlug === options.departmentSlug);
  }
  if (options.collectionSlug) {
    list = list.filter((p) => p.collectionSlug === options.collectionSlug);
  }
  if (search.q) list = searchProducts(search.q, list);
  if (search.categorie) list = list.filter((p) => p.categorySlug === search.categorie);
  if (search.brand) list = list.filter((p) => p.brandSlug === search.brand);
  if (search.pretMin !== undefined) list = list.filter((p) => p.price >= search.pretMin!);
  if (search.pretMax !== undefined) list = list.filter((p) => p.price <= search.pretMax!);
  if (search.disponibil) list = list.filter((p) => availableStock(p) > 0);
  if (search.reduceri) list = list.filter((p) => p.oldPrice !== null);

  const attrFilters = parseFiltre(search.filtre);
  for (const [key, values] of Object.entries(attrFilters)) {
    list = list.filter((p) => attributeMatches(p, key, values));
  }

  switch (search.sortare) {
    case "noi":
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "pret_asc":
      return [...list].sort((a, b) => a.price - b.price);
    case "pret_desc":
      return [...list].sort((a, b) => b.price - a.price);
    case "populare":
      return [...list].sort((a, b) => b.popularity - a.popularity);
    default:
      return [...list].sort(
        (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.popularity - a.popularity,
      );
  }
}

/** Opțiunile de filtrare disponibile pentru produsele date. */
export function attributeFacets(
  departmentSlug: string | null,
  categorySlug: string | null | undefined,
  pool: Product[],
) {
  return attributesFor(departmentSlug, categorySlug)
    .filter((def) => def.filterable)
    .map((def) => {
      const values = new Set<string>();
      for (const p of pool) {
        const raw = p.attributes[def.key];
        if (raw === undefined) continue;
        if (Array.isArray(raw)) raw.forEach((v) => values.add(String(v)));
        else values.add(String(raw));
      }
      return { def, values: [...values].sort((a, b) => a.localeCompare(b, "ro")) };
    })
    .filter((f) => f.values.length > 0);
}

export function priceBounds(pool: Product[]): { min: number; max: number } {
  if (pool.length === 0) return { min: 0, max: 500 };
  const prices = pool.map((p) => p.price);
  return { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) };
}
