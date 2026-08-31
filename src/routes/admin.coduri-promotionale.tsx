import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { coupons } from "@/data/catalog";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/coduri-promotionale")({
  head: () => ({
    meta: [
      { title: "Coduri promoționale — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea codurilor de reducere." },
      { property: "og:title", content: "Coduri promoționale — Administrare | BIJUTERII" },
      { property: "og:description", content: "Coduri de reducere." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminShell
      title="Coduri promoționale"
      description="Coduri de reducere aplicabile la finalizarea comenzii."
      actions={<button className="btn-dark">Adaugă cod</button>}
    >
      <AdminTable
        head={["Cod", "Tip", "Valoare", "Utilizări", "Expiră la", "Status"]}
        caption="Coduri promoționale"
      >
        {coupons.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
            <td className="px-4 py-3">{c.type === "procent" ? "Procent" : "Sumă fixă"}</td>
            <td className="px-4 py-3">{c.type === "procent" ? `${c.value}%` : formatPrice(c.value)}</td>
            <td className="px-4 py-3">
              {c.used} / {c.usageLimit}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(c.expiresAt)}</td>
            <td className="px-4 py-3">
              <Pill tone={c.active ? "mint" : "muted"}>{c.active ? "Activ" : "Inactiv"}</Pill>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  ),
});
