import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { collections, products } from "@/data/catalog";

export const Route = createFileRoute("/admin/colectii")({
  head: () => ({
    meta: [
      { title: "Colecții — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea colecțiilor de bijuterii." },
      { property: "og:title", content: "Colecții — Administrare | BIJUTERII" },
      { property: "og:description", content: "Colecțiile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminShell
      title="Colecții"
      description="Colecțiile afișate pe site și produsele asociate."
      actions={<button className="btn-dark">Adaugă colecție</button>}
    >
      <AdminTable head={["Colecție", "Slug", "Descriere", "Produse", "Status"]} caption="Colecții">
        {collections.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img src={c.image} alt="" loading="lazy" width={80} height={80} className="size-10 rounded-xl object-cover" />
                <span className="font-semibold">{c.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
            <td className="max-w-xs px-4 py-3 text-muted-foreground">{c.description}</td>
            <td className="px-4 py-3">{products.filter((p) => p.collectionSlug === c.slug).length}</td>
            <td className="px-4 py-3">
              <Pill tone="mint">Activă</Pill>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  ),
});
