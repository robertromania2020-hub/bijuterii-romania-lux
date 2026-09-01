import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { ORDER_STATUS_LABELS, type Order, type OrderStatus } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { mapOrder, updateOrderStatus, useLiveTable } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/comenzi")({
  head: () => ({
    meta: [
      { title: "Comenzi — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea comenzilor și a statusurilor de livrare." },
      { property: "og:title", content: "Comenzi — Administrare | BIJUTERII" },
      { property: "og:description", content: "Comenzile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminComenzi,
});

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

function AdminComenzi() {
  const { rows, loading, error } = useLiveTable<Order>("orders", mapOrder, {
    column: "created_at",
    ascending: false,
  });
  const [status, setStatus] = useState<OrderStatus | "toate">("toate");
  const [selected, setSelected] = useState<string | null>(null);

  const vizibile = status === "toate" ? rows : rows.filter((o) => o.status === status);
  const detaliu = rows.find((o) => o.id === selected) ?? null;

  async function schimbaStatus(o: Order, value: OrderStatus) {
    try {
      await updateOrderStatus(o.id, value);
      toast.success(`Comanda ${o.number}: ${ORDER_STATUS_LABELS[value]}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Statusul nu a putut fi salvat.");
    }
  }

  return (
    <AdminShell title="Comenzi" description="Urmărește și actualizează statusul comenzilor.">
      {error && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă comenzile…</p>}

      <div className="mb-4 flex flex-wrap gap-2">
        {(["toate", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              status === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
          >
            {s === "toate" ? "Toate" : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <AdminTable
        head={["Comandă", "Client", "Dată", "Produse", "Total", "Status", "Acțiuni"]}
        caption="Lista comenzilor"
      >
        {vizibile.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-3 font-semibold">{o.number}</td>
            <td className="px-4 py-3">
              <p>{o.customerName}</p>
              <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
            <td className="px-4 py-3">{o.items.length}</td>
            <td className="px-4 py-3">{formatPrice(o.total)}</td>
            <td className="px-4 py-3">
              <label className="sr-only" htmlFor={`status-${o.id}`}>
                Status pentru comanda {o.number}
              </label>
              <select
                id={`status-${o.id}`}
                className="field py-2"
                value={o.status}
                onChange={(e) => void schimbaStatus(o, e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                className="btn-soft"
                onClick={() => setSelected(selected === o.id ? null : o.id)}
              >
                Detalii
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {detaliu && (
        <AdminCard className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Comanda {detaliu.number}</h2>
            <Pill tone={detaliu.status === "anulata" ? "danger" : "mint"}>
              {ORDER_STATUS_LABELS[detaliu.status]}
            </Pill>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="text-sm">
              <h3 className="font-semibold">Date client</h3>
              <p className="mt-1 text-muted-foreground">
                {detaliu.customerName}
                <br />
                {detaliu.customerEmail}
                <br />
                {detaliu.customerPhone}
              </p>
              <h3 className="mt-4 font-semibold">Livrare</h3>
              <p className="mt-1 text-muted-foreground">
                {detaliu.city}, județul {detaliu.county}
                <br />
                AWB: {detaliu.awb ?? "—"}
              </p>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold">Produse</h3>
              <ul className="mt-2 space-y-2">
                {detaliu.items.map((it) => (
                  <li key={`${it.productId}-${it.variantLabel ?? ""}`} className="flex justify-between gap-4">
                    <span>
                      {it.name} × {it.quantity}
                    </span>
                    <span>{formatPrice(it.price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 flex justify-between border-t border-border pt-3 font-display text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(detaliu.total)}</span>
              </p>
            </div>
          </div>
        </AdminCard>
      )}
    </AdminShell>
  );
}
