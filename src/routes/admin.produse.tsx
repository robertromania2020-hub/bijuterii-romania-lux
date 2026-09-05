import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import {
  attributesFor,
  brands,
  categoriesOf,
  collections,
  departments,
  formatAttributeValue,
  getBrand,
  getCategory,
} from "@/data/catalog";
import type { AttributeValue, AttributeValues, Product } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { resolveImage } from "@/lib/asset-map";
import { ProductImagesEditor } from "@/components/admin/ProductImagesEditor";
import { fetchProductImages, type ProductImage } from "@/lib/product-images";
import {
  deleteProduct,
  mapProduct,
  saveProduct,
  updateProductFields,
  useLiveTable,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/produse")({
  head: () => ({
    meta: [
      { title: "Produse — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea produselor din catalog." },
      { property: "og:title", content: "Produse — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Adaugă, editează și dezactivează produse." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProduse,
});

type Draft = {
  id: string | null;
  name: string;
  sku: string;
  description: string;
  price: string;
  oldPrice: string;
  departmentSlug: string;
  categorySlug: string;
  brandSlug: string;
  collectionSlug: string;
  stock: string;
  minStock: string;
  images: ProductImage[];
  attributes: AttributeValues;
  status: "activ" | "inactiv";
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
};

/** Draft gol calculat la cerere: catalogul poate fi încă gol la încărcare. */
function makeEmptyDraft(): Draft {
  const dep = departments[0]?.slug ?? "";
  return {
    id: null,
    name: "",
    sku: "",
    description: "",
    price: "",
    oldPrice: "",
    departmentSlug: dep,
    categorySlug: categoriesOf(dep)[0]?.slug ?? "",
    brandSlug: "",
    collectionSlug: "",
    stock: "0",
    minStock: "5",
    images: [],
    attributes: {},
    status: "activ",
    isNew: false,
    isFeatured: false,
    isBestseller: false,
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function AdminProduse() {
  const { rows, loading, error } = useLiveTable<Product>("products", mapProduct, {
    column: "name",
    ascending: true,
  });
  const [seSalveaza, setSeSalveaza] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filter, setFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [idNou] = useState(() => `p-${Date.now()}`);

  const vizibile = rows.filter((p) => {
    const term = filter.trim().toLowerCase();
    const matchTerm =
      !term ||
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (getBrand(p.brandSlug)?.name.toLowerCase().includes(term) ?? false);
    const matchDep = !departmentFilter || p.departmentSlug === departmentFilter;
    return matchTerm && matchDep;
  });

  function openEdit(p: Product) {
    setDraft({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      departmentSlug: p.departmentSlug,
      categorySlug: p.categorySlug,
      brandSlug: p.brandSlug ?? "",
      collectionSlug: p.collectionSlug ?? "",
      stock: String(p.stock),
      minStock: String(p.minStock),
      images: p.images.map((url) => ({ id: null, url, storagePath: null, isPrimary: false })),
      attributes: { ...p.attributes },
      status: p.status,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
    });
    void fetchProductImages(p.id)
      .then((imgs) => setDraft((d) => (d && d.id === p.id ? { ...d, images: imgs } : d)))
      .catch(() => toast.error("Nu am putut încărca imaginile produsului."));
  }

  function setAttr(key: string, value: AttributeValue) {
    setDraft((d) => (d ? { ...d, attributes: { ...d.attributes, [key]: value } } : d));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (draft.name.trim().length < 3 || !draft.sku.trim() || !draft.price) {
      toast.error("Completează numele, SKU-ul și prețul.");
      return;
    }
    const existent = draft.id ? rows.find((p) => p.id === draft.id) : undefined;
    const imagini = draft.images;

    const produs: Product = {
      id: existent?.id ?? idNou,
      slug: existent?.slug ?? slugify(draft.name),
      sku: draft.sku,
      name: draft.name,
      description: draft.description,
      price: Number(draft.price),
      oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
      departmentSlug: draft.departmentSlug,
      categorySlug: draft.categorySlug,
      collectionSlug: draft.collectionSlug || null,
      brandSlug: draft.brandSlug || null,
      stock: Number(draft.stock),
      minStock: Number(draft.minStock),
      images: imagini.map((i) => i.url),
      variants: existent?.variants ?? [],
      attributes: draft.attributes,
      status: draft.status,
      isNew: draft.isNew,
      isFeatured: draft.isFeatured,
      isBestseller: draft.isBestseller,
      popularity: existent?.popularity ?? 0,
      createdAt: existent?.createdAt ?? new Date().toISOString().slice(0, 10),
    };

    setSeSalveaza(true);
    try {
      await saveProduct(produs, imagini);
      setDraft(null);
      toast.success(existent ? "Produs actualizat." : "Produs adăugat.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Produsul nu a putut fi salvat.");
    } finally {
      setSeSalveaza(false);
    }
  }

  async function comutaStatus(p: Product) {
    try {
      await updateProductFields(p.id, { status: p.status === "activ" ? "inactiv" : "activ" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Statusul nu a putut fi salvat.");
    }
  }

  async function sterge(p: Product) {
    if (!window.confirm(`Ștergi definitiv produsul „${p.name}”?`)) return;
    try {
      await deleteProduct(p.id);
      toast.success("Produs șters.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Produsul nu a putut fi șters.");
    }
  }


  const productIdCurent = draft?.id ?? idNou;
  const draftAttributes = draft ? attributesFor(draft.departmentSlug, draft.categorySlug) : [];

  return (
    <AdminShell
      title="Produse"
      description="Adaugă, editează, activează sau șterge produse din orice departament."
      actions={
        <button type="button" className="btn-dark inline-flex items-center gap-2" onClick={() => setDraft(makeEmptyDraft())}>
          <Plus className="size-4" aria-hidden="true" /> Adaugă produs
        </button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="max-w-sm flex-1">
          <label htmlFor="filtru-produse" className="sr-only">
            Caută produse
          </label>
          <input
            id="filtru-produse"
            className="field"
            placeholder="Caută după nume, SKU sau brand"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="w-56">
          <label htmlFor="filtru-departament" className="sr-only">
            Filtrează după departament
          </label>
          <select
            id="filtru-departament"
            className="field"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">Toate departamentele</option>
            {departments.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {draft && (
        <AdminCard className="mb-6">
          <h2 className="font-display text-lg font-semibold">
            {draft.id ? "Editează produs" : "Produs nou"}
          </h2>
          <form onSubmit={save} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="p-nume" className="text-sm font-semibold">Nume produs</label>
              <input id="p-nume" className="field mt-1.5" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-sku" className="text-sm font-semibold">SKU</label>
              <input id="p-sku" className="field mt-1.5" value={draft.sku} onChange={(e) => setDraft({ ...draft, sku: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-desc" className="text-sm font-semibold">Descriere</label>
              <textarea id="p-desc" rows={3} className="field mt-1.5" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-pret" className="text-sm font-semibold">Preț (lei)</label>
              <input id="p-pret" type="number" min={0} className="field mt-1.5" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-pret-vechi" className="text-sm font-semibold">Preț întreg (lei)</label>
              <input id="p-pret-vechi" type="number" min={0} className="field mt-1.5" value={draft.oldPrice} onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-departament" className="text-sm font-semibold">Departament</label>
              <select
                id="p-departament"
                className="field mt-1.5"
                value={draft.departmentSlug}
                onChange={(e) => {
                  const dep = e.target.value;
                  setDraft({
                    ...draft,
                    departmentSlug: dep,
                    categorySlug: categoriesOf(dep)[0]?.slug ?? "",
                    attributes: {},
                  });
                }}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.slug}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-categorie" className="text-sm font-semibold">Categorie</label>
              <select id="p-categorie" className="field mt-1.5" value={draft.categorySlug} onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value })}>
                {categoriesOf(draft.departmentSlug).map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-brand" className="text-sm font-semibold">Brand</label>
              <select id="p-brand" className="field mt-1.5" value={draft.brandSlug} onChange={(e) => setDraft({ ...draft, brandSlug: e.target.value })}>
                <option value="">Fără brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-colectie" className="text-sm font-semibold">Colecție</label>
              <select id="p-colectie" className="field mt-1.5" value={draft.collectionSlug} onChange={(e) => setDraft({ ...draft, collectionSlug: e.target.value })}>
                <option value="">Fără colecție</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-stoc" className="text-sm font-semibold">Stoc</label>
              <input id="p-stoc" type="number" min={0} className="field mt-1.5" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-stoc-minim" className="text-sm font-semibold">Prag stoc redus</label>
              <input id="p-stoc-minim" type="number" min={0} className="field mt-1.5" value={draft.minStock} onChange={(e) => setDraft({ ...draft, minStock: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <span className="text-sm font-semibold">Imagini</span>
              <div className="mt-1.5">
                <ProductImagesEditor
                  productId={productIdCurent}
                  images={draft.images}
                  onChange={(images) => setDraft((d) => (d ? { ...d, images } : d))}
                  disabled={seSalveaza}
                />
              </div>
            </div>

            {draftAttributes.length > 0 && (
              <fieldset className="grid gap-4 rounded-2xl border border-border p-4 sm:col-span-2 sm:grid-cols-2">
                <legend className="px-1 text-sm font-semibold">
                  Atribute specifice ({draft.departmentSlug})
                </legend>
                {draftAttributes.map((a) => {
                  const id = `attr-${a.key}`;
                  const value = draft.attributes[a.key];
                  if (a.type === "boolean") {
                    return (
                      <label key={a.id} className="flex items-center gap-2 text-sm">
                        <input
                          id={id}
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={value === true}
                          onChange={(e) => setAttr(a.key, e.target.checked)}
                        />
                        {a.label}
                      </label>
                    );
                  }
                  return (
                    <div key={a.id}>
                      <label htmlFor={id} className="text-sm font-semibold">
                        {a.label}
                        {a.unit ? ` (${a.unit})` : ""}
                      </label>
                      {a.type === "select" ? (
                        <select
                          id={id}
                          className="field mt-1.5"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => setAttr(a.key, e.target.value)}
                        >
                          <option value="">Nespecificat</option>
                          {a.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : a.type === "multi" ? (
                        <select
                          id={id}
                          multiple
                          className="field mt-1.5 h-28"
                          value={Array.isArray(value) ? value : []}
                          onChange={(e) =>
                            setAttr(
                              a.key,
                              Array.from(e.target.selectedOptions).map((o) => o.value),
                            )
                          }
                        >
                          {a.options.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      ) : a.type === "number" ? (
                        <input
                          id={id}
                          type="number"
                          className="field mt-1.5"
                          value={typeof value === "number" ? String(value) : ""}
                          onChange={(e) => setAttr(a.key, Number(e.target.value))}
                        />
                      ) : (
                        <input
                          id={id}
                          className="field mt-1.5"
                          value={typeof value === "string" ? value : ""}
                          onChange={(e) => setAttr(a.key, e.target.value)}
                        />
                      )}
                    </div>
                  );
                })}
              </fieldset>
            )}

            <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={draft.status === "activ"} onChange={(e) => setDraft({ ...draft, status: e.target.checked ? "activ" : "inactiv" })} />
                Produs activ
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={draft.isNew} onChange={(e) => setDraft({ ...draft, isNew: e.target.checked })} />
                Produs nou
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={draft.isFeatured} onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })} />
                Produs recomandat
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-primary" checked={draft.isBestseller} onChange={(e) => setDraft({ ...draft, isBestseller: e.target.checked })} />
                Bestseller
              </label>
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" className="btn-dark" disabled={seSalveaza}>
                {seSalveaza ? "Se salvează produsul…" : "Salvează"}
              </button>
              <button type="button" className="btn-soft" onClick={() => setDraft(null)}>Renunță</button>
            </div>
          </form>
        </AdminCard>
      )}

      {error && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă produsele…</p>}

      <AdminTable
        head={["Produs", "Departament", "SKU", "Preț", "Stoc", "Variante", "Status", "Acțiuni"]}
        caption="Lista produselor din catalog"
      >
        {vizibile.map((p) => {
          const defs = attributesFor(p.departmentSlug, p.categorySlug);
          const rezumat = defs
            .filter((d) => {
              const v = p.attributes[d.key];
              return d.showOnProduct && v !== undefined && v !== null;
            })
            .slice(0, 2)
            .map((d) => String(formatAttributeValue(d, p.attributes[d.key]!) ?? ""))
            .filter(Boolean)
            .join(" · ");
          return (
            <tr key={p.id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={resolveImage(p.images[0])} alt="" loading="lazy" width={80} height={80} className="size-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {[getBrand(p.brandSlug)?.name, getCategory(p.categorySlug)?.name, rezumat]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {departments.find((d) => d.slug === p.departmentSlug)?.name ?? p.departmentSlug}
              </td>
              <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
              <td className="px-4 py-3">
                {formatPrice(p.price)}
                {p.oldPrice && (
                  <span className="ml-1 text-xs text-muted-foreground line-through">
                    {formatPrice(p.oldPrice)}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">{p.stock}</td>
              <td className="px-4 py-3">{p.variants.length || "—"}</td>
              <td className="px-4 py-3">
                <Pill tone={p.status === "activ" ? "mint" : "muted"}>
                  {p.status === "activ" ? "Activ" : "Inactiv"}
                </Pill>
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2">
                  <button type="button" className="btn-soft" onClick={() => openEdit(p)} aria-label={`Editează ${p.name}`}>
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    className="btn-soft"
                    aria-label={`Activează sau dezactivează ${p.name}`}
                    onClick={() => void comutaStatus(p)}
                  >
                    {p.status === "activ" ? "Dezactivează" : "Activează"}
                  </button>
                  <button
                    type="button"
                    className="btn-soft text-destructive"
                    aria-label={`Șterge ${p.name}`}
                    onClick={() => void sterge(p)}
                  >
                    <Trash2 className="size-4" />
                  </button>

                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>
      {vizibile.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Niciun produs nu corespunde căutării.</p>
      )}
    </AdminShell>
  );
}
