import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/data/types";
import { mapCustomerOrder, mesajEroare, ORDER_SELECT, type CustomerOrder } from "@/lib/shop-data";

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
  component: AdminClienti,
});

interface ClientRand {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string | null;
}

function AdminClienti() {
  const [rows, setRows] = useState<ClientRand[]>([]);
  const [cautare, setCautare] = useState("");
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState<string | null>(null);
  const [selectat, setSelectat] = useState<ClientRand | null>(null);
  const [comenzi, setComenzi] = useState<CustomerOrder[]>([]);

  useEffect(() => {
    void (async () => {
      const { data, error } = await supabase.rpc("admin_customers");
      if (error) setEroare(mesajEroare(error, "Nu am putut încărca lista de clienți."));
      else {
        setRows(
          (data ?? []).map((r) => ({
            userId: r.user_id as string,
            firstName: r.first_name ?? "",
            lastName: r.last_name ?? "",
            email: r.email ?? "",
            phone: r.phone ?? "",
            createdAt: String(r.created_at ?? ""),
            ordersCount: Number(r.orders_count ?? 0),
            totalSpent: Number(r.total_spent ?? 0),
            lastOrderAt: (r.last_order_at as string | null) ?? null,
          })),
        );
      }
      setLoading(false);
    })();
  }, []);

  async function deschide(c: ClientRand) {
    if (selectat?.userId === c.userId) {
      setSelectat(null);
      return;
    }
    setSelectat(c);
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", c.userId)
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(mesajEroare(error, "Nu am putut încărca comenzile clientului."));
      setComenzi([]);
      return;
    }
    setComenzi(((data ?? []) as unknown as Record<string, unknown>[]).map(mapCustomerOrder));
  }

  const q = cautare.trim().toLowerCase();
  const vizibili = q
    ? rows.filter((c) =>
        [`${c.lastName} ${c.firstName}`, c.email, c.phone]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : rows;

  return (
    <AdminShell title="Clienți" description="Clienții înregistrați și activitatea lor.">
      {eroare && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{eroare}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă clienții…</p>}

      <div className="mb-4">
        <label className="sr-only" htmlFor="cautare-clienti">Caută client</label>
        <input
          id="cautare-clienti"
          className="field max-w-sm"
          placeholder="Caută după nume, email sau telefon"
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
        />
      </div>

      <AdminTable
        head={["Nume", "Email", "Telefon", "Înregistrat", "Comenzi", "Total cumpărături", "Ultima comandă", "Acțiuni"]}
        caption="Lista clienților"
      >
        {vizibili.map((c) => (
          <tr key={c.userId}>
            <td className="px-4 py-3 font-semibold">
              {`${c.lastName} ${c.firstName}`.trim() || "—"}
            </td>
            <td className="px-4 py-3 text-muted-foreground">{c.email || "—"}</td>
            <td className="px-4 py-3 text-muted-foreground">{c.phone || "—"}</td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(c.createdAt)}</td>
            <td className="px-4 py-3">{c.ordersCount}</td>
            <td className="px-4 py-3">{formatPrice(c.totalSpent)}</td>
            <td className="px-4 py-3 text-muted-foreground">
              {c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"}
            </td>
            <td className="px-4 py-3">
              <button type="button" className="btn-soft" onClick={() => void deschide(c)}>
                Istoric
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {selectat && (
        <AdminCard className="mt-6">
          <h2 className="font-display text-lg font-semibold">
            Comenzile clientului {`${selectat.lastName} ${selectat.firstName}`.trim()}
          </h2>
          {comenzi.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Clientul nu are comenzi.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {comenzi.map((o) => (
                <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
                  <span className="font-semibold">{o.number}</span>
                  <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
                  <span>{ORDER_STATUS_LABELS[o.status as OrderStatus]}</span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      )}
    </AdminShell>
  );
}
