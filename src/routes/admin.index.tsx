import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { ORDER_STATUS_LABELS, stockStatus, type Order, type Product } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { mapOrder, mapProduct, useLiveTable } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Prezentare generală — Administrare | BIJUTERII" },
      { name: "description", content: "Panoul de administrare al magazinului BIJUTERII." },
      { property: "og:title", content: "Administrare | BIJUTERII" },
      { property: "og:description", content: "Panou de administrare." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { rows: orders } = useLiveTable<Order>("orders", mapOrder, {
    column: "created_at",
    ascending: false,
  });
  const { rows: products } = useLiveTable<Product>("products", mapProduct, {
    column: "name",
    ascending: true,
  });

  const venit = orders.filter((o) => o.status !== "anulata").reduce((sum, o) => sum + o.total, 0);
  const stocRedus = products.filter((p) => stockStatus(p) !== "in_stoc");
  const clienti = new Set(orders.map((o) => o.customerEmail)).size;

  const kpi = [
    { label: "Comenzi totale", value: String(orders.length), tone: "bg-lilac" },
    { label: "Venit total", value: formatPrice(venit), tone: "bg-mint" },
    {
      label: "Produse active",
      value: String(products.filter((p) => p.status === "activ").length),
      tone: "bg-peach",
    },
    { label: "Clienți", value: String(clienti), tone: "bg-lilac" },
  ];

  return (
    <AdminShell title="Prezentare generală" description="Situația magazinului în timp real.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((k) => (
          <div key={k.label} className={`rounded-3xl p-5 ${k.tone}`}>
            <p className="text-sm text-muted-foreground">{k.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h2 className="mb-3 font-display text-lg font-semibold">Comenzi recente</h2>
          <AdminTable head={["Comandă", "Client", "Dată", "Total", "Status"]} caption="Comenzi recente">
            {orders.slice(0, 8).map((o) => (
              <tr key={o.id}>
                <td className="px-4 py-3 font-semibold">{o.number}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">{formatPrice(o.total)}</td>
                <td className="px-4 py-3">
                  <Pill tone={o.status === "anulata" ? "danger" : "mint"}>
                    {ORDER_STATUS_LABELS[o.status]}
                  </Pill>
                </td>
              </tr>
            ))}
          </AdminTable>
          <Link to="/admin/comenzi" className="btn-soft mt-3 inline-block">
            Vezi toate comenzile
          </Link>
        </div>

        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Alerte de stoc</h2>
          <ul className="mt-3 space-y-3 text-sm">
            {stocRedus.length === 0 && (
              <li className="text-muted-foreground">Toate produsele au stoc suficient.</li>
            )}
            {stocRedus.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3">
                <span>{p.name}</span>
                <Pill tone={p.stock === 0 ? "danger" : "peach"}>
                  {p.stock === 0 ? "Stoc epuizat" : "Stoc redus"}
                </Pill>
              </li>
            ))}
          </ul>
          <Link to="/admin/stoc" className="btn-soft mt-4 inline-block">
            Gestionează stocul
          </Link>
        </AdminCard>
      </div>
    </AdminShell>
  );
}
