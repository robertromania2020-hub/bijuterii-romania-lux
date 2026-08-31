import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { categories, products } from "@/data/catalog";

export const Route = createFileRoute("/admin/categorii")({
  head: () => ({
    meta: [
      { title: "Categorii — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea categoriilor de produse." },
      { property: "og:title", content: "Categorii — Administrare | BIJUTERII" },
      { property: "og:description", content: "Categoriile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminShell
      title="Categorii"
      description="Structura de categorii afișată în magazin."
      actions={<button className="btn-dark">Adaugă categorie</button>}
    >
      <AdminTable head={["Categorie", "Slug", "Produse în catalog", "Status"]} caption="Categorii">
        {categories.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={c.image} alt="" loading="lazy" width={80} height={80} className="size-10 rounded-xl object-cover" />
                <span className="font-semibold">{c.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
            <td className="px-4 py-3">
              {products.filter((p) => p.categorySlug === c.slug).length}
            </td>
            <td className="px-4 py-3">
              <Pill tone="mint">Activă</Pill>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  ),
});
