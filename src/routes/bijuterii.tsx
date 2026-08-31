import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageHeading, SiteLayout, EmptyState } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { categories, products } from "@/data/catalog";
import { MATERIAL_LABELS, stockStatus, type Material } from "@/data/types";

type Sortare = "recomandate" | "noi" | "pret_asc" | "pret_desc" | "populare";

interface BijuteriiSearch {
  q?: string | undefined;
  categorie?: string | undefined;
  material?: string | undefined;
  pretMax?: number | undefined;
  disponibil?: boolean | undefined;
  sortare?: Sortare | undefined;
}

export const Route = createFileRoute("/bijuterii")({
  validateSearch: (search: Record<string, unknown>): BijuteriiSearch => ({
    q: typeof search['q'] === "string" && search['q'] ? search['q'] : undefined,
    categorie: typeof search['categorie'] === "string" ? search['categorie'] : undefined,
    material: typeof search['material'] === "string" ? search['material'] : undefined,
    pretMax: typeof search['pretMax'] === "number" ? search['pretMax'] : undefined,
    disponibil: search['disponibil'] === true ? true : undefined,
    sortare: (["recomandate", "noi", "pret_asc", "pret_desc", "populare"] as const).includes(
      search['sortare'] as Sortare,
    )
      ? (search['sortare'] as Sortare)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Bijuterii — inele, brățări, coliere, cercei | BIJUTERII" },
      {
        name: "description",
        content:
          "Toate bijuteriile noastre: filtrează după categorie, material, preț și disponibilitate. Livrare rapidă în toată România.",
      },
      { property: "og:title", content: "Bijuterii — catalog complet | BIJUTERII" },
      {
        property: "og:description",
        content: "Inele, brățări, coliere și cercei din oțel inoxidabil și placate cu aur.",
      },
    ],
  }),
  component: ListingPage,
});

const SORT_LABELS: Record<Sortare, string> = {
  recomandate: "Recomandate",
  noi: "Cele mai noi",
  pret_asc: "Preț: crescător",
  pret_desc: "Preț: descrescător",
  populare: "Cele mai populare",
};

function ListingPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const setSearch = (patch: Partial<BijuteriiSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  const rezultate = useMemo(() => {
    const term = (search['q'] ?? "").trim().toLowerCase();
    let list = products.filter((p) => p.status === "activ");

    if (term) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term),
      );
    }
    if (search['categorie']) {
      list = list.filter(
        (p) =>
          p.categorySlug === search['categorie'] ||
          (search['categorie'] === "reduceri" && p.oldPrice !== null) ||
          (search['categorie'] === "placate-cu-aur" && p.material === "aur") ||
          (search['categorie'] === "otel" && p.material === "otel"),
      );
    }
    if (search['material']) {
      list = list.filter((p) => p.material === search['material']);
    }
    if (search['pretMax']) {
      list = list.filter((p) => p.price <= search['pretMax']!);
    }
    if (search['disponibil']) {
      list = list.filter((p) => stockStatus(p) !== "stoc_epuizat");
    }

    switch (search['sortare']) {
      case "noi":
        return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "pret_asc":
        return [...list].sort((a, b) => a.price - b.price);
      case "pret_desc":
        return [...list].sort((a, b) => b.price - a.price);
      case "populare":
        return [...list].sort((a, b) => b.popularity - a.popularity);
      default:
        return [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    }
  }, [search]);

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Catalog"
        title="Bijuterii"
        description="Filtrează după categorie, material, preț și disponibilitate pentru a găsi piesa potrivită."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-border bg-surface p-4" aria-label="Filtre">
          <div>
            <label htmlFor="filtru-cautare" className="text-sm font-semibold">
              Căutare
            </label>
            <input
              id="filtru-cautare"
              className="field mt-2"
              placeholder="Caută produse"
              value={search['q'] ?? ""}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="filtru-categorie" className="text-sm font-semibold">
              Categorie
            </label>
            <select
              id="filtru-categorie"
              className="field mt-2"
              value={search['categorie'] ?? ""}
              onChange={(e) => setSearch({ categorie: e.target.value || undefined })}
            >
              <option value="">Toate categoriile</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="filtru-material" className="text-sm font-semibold">
              Material
            </label>
            <select
              id="filtru-material"
              className="field mt-2"
              value={search['material'] ?? ""}
              onChange={(e) => setSearch({ material: e.target.value || undefined })}
            >
              <option value="">Toate materialele</option>
              {(Object.keys(MATERIAL_LABELS) as Material[]).map((m) => (
                <option key={m} value={m}>
                  {MATERIAL_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="filtru-pret" className="text-sm font-semibold">
              Preț maxim: {search['pretMax'] ?? 500} lei
            </label>
            <input
              id="filtru-pret"
              type="range"
              min={50}
              max={500}
              step={10}
              className="mt-3 w-full accent-primary"
              value={search['pretMax'] ?? 500}
              onChange={(e) => setSearch({ pretMax: Number(e.target.value) })}
            />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <input
              id="filtru-disponibil"
              type="checkbox"
              className="size-4 accent-primary"
              checked={search['disponibil'] ?? false}
              onChange={(e) => setSearch({ disponibil: e.target.checked || undefined })}
            />
            <label htmlFor="filtru-disponibil" className="text-sm">
              Doar produse disponibile
            </label>
          </div>

          <button
            type="button"
            className="btn-soft mt-5 w-full"
            onClick={() => navigate({ search: {} })}
          >
            Resetează filtrele
          </button>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {rezultate.length} produse găsite
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sortare" className="text-sm text-muted-foreground">
                Sortează
              </label>
              <select
                id="sortare"
                className="field w-auto"
                value={search['sortare'] ?? "recomandate"}
                onChange={(e) => setSearch({ sortare: e.target.value as Sortare })}
              >
                {(Object.keys(SORT_LABELS) as Sortare[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {rezultate.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Niciun produs găsit"
                description="Încearcă să modifici filtrele sau termenul de căutare."
                action={
                  <button className="btn-dark" onClick={() => navigate({ search: {} })}>
                    Resetează filtrele
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {rezultate.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
