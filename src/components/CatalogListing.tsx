import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { EmptyState, PageHeading } from "@/components/SiteLayout";
import { activeProducts, brands as allBrands, categoriesOf, categories } from "@/data/catalog";
import type { Product } from "@/data/types";
import {
  attributeFacets,
  filterProducts,
  parseFiltre,
  priceBounds,
  SORT_LABELS,
  stringifyFiltre,
  type ListingSearch,
  type Sortare,
} from "@/lib/listing";

interface CatalogListingProps {
  departmentSlug: string | null;
  eyebrow: string;
  title: string;
  description: string;
  search: ListingSearch;
  onChange: (patch: Partial<ListingSearch>) => void;
  onReset: () => void;
  source?: Product[];
}

export function CatalogListing({
  departmentSlug,
  eyebrow,
  title,
  description,
  search,
  onChange,
  onReset,
  source,
}: CatalogListingProps) {
  const base = source ?? activeProducts();

  const pool = useMemo(
    () =>
      departmentSlug ? base.filter((p) => p.departmentSlug === departmentSlug) : base,
    [base, departmentSlug],
  );

  const results = useMemo(
    () => filterProducts(search, { departmentSlug, source: base }),
    [search, departmentSlug, base],
  );

  const cats = departmentSlug
    ? categoriesOf(departmentSlug)
    : categories.filter((c) => c.active);

  const brandOptions = allBrands.filter((b) => pool.some((p) => p.brandSlug === b.slug));

  const facets = attributeFacets(departmentSlug, search.categorie ?? null, pool);
  const activeAttrs = parseFiltre(search.filtre);
  const bounds = priceBounds(pool);

  function toggleAttr(key: string, value: string) {
    const next = { ...activeAttrs };
    const current = next[key] ?? [];
    next[key] = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    if (next[key]!.length === 0) delete next[key];
    onChange({ filtre: stringifyFiltre(next) });
  }

  return (
    <>
      <PageHeading eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-3xl border border-border bg-surface p-4" aria-label="Filtre">
          <div>
            <label htmlFor="filtru-cautare" className="text-sm font-semibold">
              Căutare
            </label>
            <input
              id="filtru-cautare"
              className="field mt-2"
              placeholder="Caută după nume, brand sau cod"
              value={search.q ?? ""}
              onChange={(e) => onChange({ q: e.target.value || undefined })}
            />
          </div>

          <div className="mt-5">
            <label htmlFor="filtru-categorie" className="text-sm font-semibold">
              Categorie
            </label>
            <select
              id="filtru-categorie"
              className="field mt-2"
              value={search.categorie ?? ""}
              onChange={(e) =>
                onChange({ categorie: e.target.value || undefined, filtre: undefined })
              }
            >
              <option value="">Toate categoriile</option>
              {cats.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {brandOptions.length > 1 && (
            <div className="mt-5">
              <label htmlFor="filtru-brand" className="text-sm font-semibold">
                Brand
              </label>
              <select
                id="filtru-brand"
                className="field mt-2"
                value={search.brand ?? ""}
                onChange={(e) => onChange({ brand: e.target.value || undefined })}
              >
                <option value="">Toate brandurile</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.slug}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {facets.map(({ def, values }) => (
            <fieldset key={def.id} className="mt-5">
              <legend className="text-sm font-semibold">{def.label}</legend>
              <div className="mt-2 flex flex-col gap-1.5">
                {values.map((value) => {
                  const id = `f-${def.key}-${value}`;
                  const checked = (activeAttrs[def.key] ?? []).includes(value);
                  return (
                    <label key={value} htmlFor={id} className="flex items-center gap-2 text-sm">
                      <input
                        id={id}
                        type="checkbox"
                        className="size-4 accent-primary"
                        checked={checked}
                        onChange={() => toggleAttr(def.key, value)}
                      />
                      {value}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="mt-5">
            <label htmlFor="filtru-pret" className="text-sm font-semibold">
              Preț maxim: {search.pretMax ?? bounds.max} lei
            </label>
            <input
              id="filtru-pret"
              type="range"
              min={bounds.min}
              max={bounds.max}
              step={10}
              className="mt-3 w-full accent-primary"
              value={search.pretMax ?? bounds.max}
              onChange={(e) => onChange({ pretMax: Number(e.target.value) })}
            />
          </div>

          <div className="mt-5 flex items-center gap-2">
            <input
              id="filtru-disponibil"
              type="checkbox"
              className="size-4 accent-primary"
              checked={search.disponibil ?? false}
              onChange={(e) => onChange({ disponibil: e.target.checked || undefined })}
            />
            <label htmlFor="filtru-disponibil" className="text-sm">
              Doar produse în stoc
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input
              id="filtru-reduceri"
              type="checkbox"
              className="size-4 accent-primary"
              checked={search.reduceri ?? false}
              onChange={(e) => onChange({ reduceri: e.target.checked || undefined })}
            />
            <label htmlFor="filtru-reduceri" className="text-sm">
              Doar produse la reducere
            </label>
          </div>

          <button type="button" className="btn-soft mt-5 w-full" onClick={onReset}>
            Resetează filtrele
          </button>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {results.length} produse găsite
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sortare" className="text-sm text-muted-foreground">
                Sortează
              </label>
              <select
                id="sortare"
                className="field w-auto"
                value={search.sortare ?? "recomandate"}
                onChange={(e) => onChange({ sortare: e.target.value as Sortare })}
              >
                {(Object.keys(SORT_LABELS) as Sortare[]).map((s) => (
                  <option key={s} value={s}>
                    {SORT_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="mt-6">
              <EmptyState
                title="Niciun produs găsit"
                description="Încearcă să modifici filtrele sau termenul de căutare."
                action={
                  <button className="btn-dark" onClick={onReset}>
                    Resetează filtrele
                  </button>
                }
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
