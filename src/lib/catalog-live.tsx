/**
 * Încarcă întregul catalog (departamente, categorii, branduri, colecții,
 * definiții de atribute și produse cu imagini / variante / atribute) din
 * baza de date și îl injectează în modulul `@/data/catalog`, cu actualizare
 * în timp real.
 */
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hydrateCatalog, type CatalogSnapshot } from "@/data/catalog";
import { resolveImage } from "@/lib/asset-map";
import {
  mapAttributeDefinition,
  mapBrand,
  mapCategory,
  mapCollection,
  mapDepartment,
  mapProduct,
  PRODUCT_SELECT,
  type Row,
} from "@/lib/admin-data";

const CATALOG_TABLES = [
  "departments",
  "categories",
  "brands",
  "collections",
  "attribute_definitions",
  "products",
  "product_images",
  "product_variants",
  "product_attribute_values",
] as const;

export async function fetchCatalog(): Promise<CatalogSnapshot> {
  const [dep, cat, bra, col, att, pro] = await Promise.all([
    supabase.from("departments").select("*").order("position"),
    supabase.from("categories").select("*").order("position"),
    supabase.from("brands").select("*").order("position"),
    supabase.from("collections").select("*").order("position"),
    supabase.from("attribute_definitions").select("*").order("position"),
    supabase.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false }),
  ]);

  const firstError = [dep, cat, bra, col, att, pro].find((r) => r.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const products = ((pro.data ?? []) as Row[]).map((r) => {
    const p = mapProduct(r);
    return {
      ...p,
      images: p.images.map(resolveImage),
      variants: p.variants.map((v) => ({ ...v, image: v.image ? resolveImage(v.image) : null })),
    };
  });

  const withImage = <T extends { image?: string | null }>(item: T): T => ({
    ...item,
    image: item.image ? resolveImage(item.image) : item.image,
  });

  return {
    departments: ((dep.data ?? []) as Row[]).map(mapDepartment).map(withImage),
    categories: ((cat.data ?? []) as Row[]).map(mapCategory).map(withImage),
    brands: ((bra.data ?? []) as Row[]).map(mapBrand),
    collections: ((col.data ?? []) as Row[]).map(mapCollection).map(withImage),
    attributeDefinitions: ((att.data ?? []) as Row[]).map(mapAttributeDefinition),
    products,
  };
}

let catalogPromise: Promise<void> | null = null;

/**
 * Se asigură că modulul `@/data/catalog` este populat. Poate fi apelată din
 * loadere de rută, înainte de randarea componentelor.
 */
export function ensureCatalog(): Promise<void> {
  if (!catalogPromise) {
    catalogPromise = fetchCatalog()
      .then(hydrateCatalog)
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
  return catalogPromise;
}

interface CatalogState {
  ready: boolean;
  error: string | null;
  version: number;
  reload: () => Promise<void>;
}

const CatalogContext = createContext<CatalogState>({
  ready: false,
  error: null,
  version: 0,
  reload: async () => {},
});

export function useCatalog() {
  return useContext(CatalogContext);
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    let initial = true;

    const load = async () => {
      try {
        if (!initial) {
          const snapshot = await fetchCatalog();
          if (cancelled) return;
          hydrateCatalog(snapshot);
        } else {
          await ensureCatalog();
          if (cancelled) return;
        }
        initial = false;
        setError(null);
        setVersion((v) => v + 1);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Eroare la încărcare.");
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void load();

    const scheduleReload = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void load(), 250);
    };

    const channel = supabase.channel("catalog-live");
    for (const table of CATALOG_TABLES) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, scheduleReload);
    }
    channel.subscribe();

    return () => {
      cancelled = true;
      if (timer.current) clearTimeout(timer.current);
      void supabase.removeChannel(channel);
    };
  }, []);

  return (
    <CatalogContext.Provider value={{ ready, error, version, reload: async () => {} }}>
      {children}
    </CatalogContext.Provider>
  );
}

/** Ecran de așteptare pentru paginile care depind de catalog. */
export function CatalogGate({ children }: { children: ReactNode }) {
  const { ready, error, version } = useCatalog();

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4">
        <p className="text-sm text-muted-foreground">Se încarcă catalogul…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-4 text-center">
        <div>
          <p className="font-semibold text-foreground">Catalogul nu a putut fi încărcat.</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return <div key={version}>{children}</div>;
}
