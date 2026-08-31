import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { categories, collections, products as seed } from "@/data/catalog";
import { MATERIAL_LABELS, type Material, type Product } from "@/data/types";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/produse")({
  head: () => ({
    meta: [
      { title: "Produse — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea produselor din catalog." },
      { property: "og:title", content: "Produse — Administrare | BIJUTERII" },
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
  material: Material;
  categorySlug: string;
  collectionSlug: string;
  stock: string;
  images: string;
  status: "activ" | "inactiv";
  isNew: boolean;
  isFeatured: boolean;
};

const emptyDraft: Draft = {
  id: null,
  name: "",
  sku: "",
  description: "",
  price: "",
  oldPrice: "",
  material: "aur",
  categorySlug: categories[0].slug,
  collectionSlug: "",
  stock: "0",
  images: "",
  status: "activ",
  isNew: false,
  isFeatured: false,
};

function AdminProduse() {
  const [list, setList] = useState<Product[]>(seed);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [filter, setFilter] = useState("");

  const vizibile = list.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      p.sku.toLowerCase().includes(filter.toLowerCase()),
  );

  function openEdit(p: Product) {
    setDraft({
      id: p.id,
      name: p.name,
      sku: p.sku,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      material: p.material,
      categorySlug: p.categorySlug,
      collectionSlug: p.collectionSlug ?? "",
      stock: String(p.stock),
      images: p.images.join(", "),
      status: p.status,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
    });
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    if (draft.name.trim().length < 3 || !draft.sku.trim() || !draft.price) {
      toast.error("Completează numele, SKU-ul și prețul.");
      return;
    }
    setList((prev) =>
      draft.id
        ? prev.map((p) =>
            p.id === draft.id
              ? {
                  ...p,
                  name: draft.name,
                  sku: draft.sku,
                  description: draft.description,
                  price: Number(draft.price),
                  oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
                  material: draft.material,
                  categorySlug: draft.categorySlug,
                  collectionSlug: draft.collectionSlug || null,
                  stock: Number(draft.stock),
                  status: draft.status,
                  isNew: draft.isNew,
                  isFeatured: draft.isFeatured,
                }
              : p,
          )
        : [
            {
              id: `nou-${Date.now()}`,
              slug: draft.name.toLowerCase().replace(/\s+/g, "-"),
              sku: draft.sku,
              name: draft.name,
              description: draft.description,
              price: Number(draft.price),
              oldPrice: draft.oldPrice ? Number(draft.oldPrice) : null,
              material: draft.material,
              categorySlug: draft.categorySlug,
              collectionSlug: draft.collectionSlug || null,
              stock: Number(draft.stock),
              minStock: 5,
              images: seed[0].images,
              variants: [],
              status: draft.status,
              isNew: draft.isNew,
              isFeatured: draft.isFeatured,
              popularity: 0,
              createdAt: new Date().toISOString().slice(0, 10),
            },
            ...prev,
          ],
    );
    setDraft(null);
    toast.success("Modificările sunt vizibile local. Salvarea permanentă urmează în etapa următoare.");
  }

  return (
    <AdminShell
      title="Produse"
      description="Adaugă, editează, activează sau șterge produse din catalog."
      actions={
        <button type="button" className="btn-dark inline-flex items-center gap-2" onClick={() => setDraft(emptyDraft)}>
          <Plus className="size-4" aria-hidden="true" /> Adaugă produs
        </button>
      }
    >
      <div className="mb-4 max-w-sm">
        <label htmlFor="filtru-produse" className="sr-only">
          Caută produse
        </label>
        <input
          id="filtru-produse"
          className="field"
          placeholder="Caută după nume sau SKU"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
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
              <label htmlFor="p-pret-redus" className="text-sm font-semibold">Preț redus (lei)</label>
              <input id="p-pret-redus" type="number" min={0} className="field mt-1.5" value={draft.oldPrice} onChange={(e) => setDraft({ ...draft, oldPrice: e.target.value })} />
            </div>
            <div>
              <label htmlFor="p-material" className="text-sm font-semibold">Material</label>
              <select id="p-material" className="field mt-1.5" value={draft.material} onChange={(e) => setDraft({ ...draft, material: e.target.value as Material })}>
                {(Object.keys(MATERIAL_LABELS) as Material[]).map((m) => (
                  <option key={m} value={m}>{MATERIAL_LABELS[m]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="p-categorie" className="text-sm font-semibold">Categorie</label>
              <select id="p-categorie" className="field mt-1.5" value={draft.categorySlug} onChange={(e) => setDraft({ ...draft, categorySlug: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
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
            <div className="sm:col-span-2">
              <label htmlFor="p-imagini" className="text-sm font-semibold">Imagini</label>
              <input id="p-imagini" className="field mt-1.5" placeholder="Încărcarea imaginilor va fi disponibilă după conectarea stocării" value={draft.images} onChange={(e) => setDraft({ ...draft, images: e.target.value })} />
            </div>
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
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" className="btn-dark">Salvează</button>
              <button type="button" className="btn-soft" onClick={() => setDraft(null)}>Renunță</button>
            </div>
          </form>
        </AdminCard>
      )}

      <AdminTable
        head={["Produs", "SKU", "Preț", "Stoc", "Status", "Acțiuni"]}
        caption="Lista produselor din catalog"
      >
        {vizibile.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={p.images[0]} alt="" loading="lazy" width={80} height={80} className="size-10 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{MATERIAL_LABELS[p.material]}</p>
                </div>
              </div>
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
                  onClick={() =>
                    setList((prev) =>
                      prev.map((x) =>
                        x.id === p.id ? { ...x, status: x.status === "activ" ? "inactiv" : "activ" } : x,
                      ),
                    )
                  }
                >
                  {p.status === "activ" ? "Dezactivează" : "Activează"}
                </button>
                <button
                  type="button"
                  className="btn-soft text-destructive"
                  aria-label={`Șterge ${p.name}`}
                  onClick={() => {
                    setList((prev) => prev.filter((x) => x.id !== p.id));
                    toast.success("Produs eliminat din listă (temporar).");
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </AdminTable>
      {vizibile.length === 0 && (
        <p className="mt-4 text-sm text-muted-foreground">Niciun produs nu corespunde căutării.</p>
      )}
    </AdminShell>
  );
}
