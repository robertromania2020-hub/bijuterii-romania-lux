import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { orders as seed } from "@/data/catalog";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";

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
  const [list, setList] = useState(seed);
  const [status, setStatus] = useState<OrderStatus | "toate">("toate");
  const [selected, setSelected] = useState<string | null>(null);

  const vizibile = status === "toate" ? list : list.filter((o) => o.status === status);
  const detaliu = list.find((o) => o.id === selected) ?? null;

  return (
    <AdminShell title="Comenzi" description="Urmărește și actualizează statusul comenzilor.">
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
                onChange={(e) => {
                  const value = e.target.value as OrderStatus;
                  setList((prev) => prev.map((x) => (x.id === o.id ? { ...x, status: value } : x)));
                  toast.success(`Comanda ${o.number}: ${ORDER_STATUS_LABELS[value]}`);
                }}
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
                {detaliu.shippingAddress}
                <br />
                Metodă: {detaliu.shippingMethod} · Plată: {detaliu.paymentMethod}
                <br />
                AWB: {detaliu.awb ?? "—"}
              </p>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold">Produse</h3>
              <ul className="mt-2 space-y-2">
                {detaliu.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4">
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
