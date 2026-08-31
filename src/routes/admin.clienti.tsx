import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { customers } from "@/data/catalog";
import { formatDate, formatPrice } from "@/lib/format";

export const Route = createFileRoute("/admin/clienti")({
  head: () => ({
    meta: [
      { title: "Clienți — Administrare | BIJUTERII" },
      { name: "description", content: "Lista clienților magazinului." },
      { property: "og:title", content: "Clienți — Administrare | BIJUTERII" },
      { property: "og:description", content: "Clienții magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <AdminShell title="Clienți" description="Clienții înregistrați și activitatea lor.">
      <AdminTable
        head={["Client", "Contact", "Comenzi", "Total cheltuit", "Client din"]}
        caption="Lista clienților"
      >
        {customers.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3 font-semibold">{c.name}</td>
            <td className="px-4 py-3 text-muted-foreground">
              {c.email}
              <br />
              {c.phone}
            </td>
            <td className="px-4 py-3">{c.ordersCount}</td>
            <td className="px-4 py-3">{formatPrice(c.totalSpent)}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  ),
});
