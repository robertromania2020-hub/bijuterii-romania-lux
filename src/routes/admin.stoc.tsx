import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { STOCK_LABELS, stockStatus, type Product } from "@/data/types";
import { mapProduct, updateProductFields, useLiveTable } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/stoc")({
  head: () => ({
    meta: [
      { title: "Stoc — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea stocurilor și avertizări pentru stoc redus." },
      { property: "og:title", content: "Stoc — Administrare | BIJUTERII" },
      { property: "og:description", content: "Stocuri și alerte." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminStoc,
});

function AdminStoc() {
  const { rows, setRows, loading, error } = useLiveTable<Product>("products", mapProduct, {
    column: "name",
    ascending: true,
  });
  const [salveaza, setSalveaza] = useState<string | null>(null);

  const alerte = rows.filter((p) => stockStatus(p) !== "in_stoc");

  async function salveazaStoc(p: Product, stoc: number) {
    setSalveaza(p.id);
    try {
      await updateProductFields(p.id, { stock: stoc });
      toast.success(`Stoc actualizat pentru ${p.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Stocul nu a putut fi salvat.");
    } finally {
      setSalveaza(null);
    }
  }

  return (
    <AdminShell title="Stoc" description="Monitorizează stocurile și actualizează cantitățile.">
      {error && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă stocurile…</p>}

      {alerte.length > 0 && (
        <div className="mb-5 rounded-3xl bg-peach p-4 text-sm">
          <p className="font-semibold">{alerte.length} produse necesită atenție</p>
          <p className="text-muted-foreground">
            Verifică produsele marcate cu „Stoc redus” sau „Stoc epuizat”.
          </p>
        </div>
      )}

      <AdminTable
        head={["Produs", "SKU", "Stoc actual", "Stoc minim", "Status stoc"]}
        caption="Situația stocurilor"
      >
        {rows.map((p) => {
          const status = stockStatus(p);
          return (
            <tr key={p.id}>
              <td className="px-4 py-3 font-semibold">{p.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
              <td className="px-4 py-3">
                <label className="sr-only" htmlFor={`stoc-${p.id}`}>
                  Stoc pentru {p.name}
                </label>
                <input
                  id={`stoc-${p.id}`}
                  type="number"
                  min={0}
                  disabled={salveaza === p.id}
                  className="field w-24"
                  value={p.stock}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((x) =>
                        x.id === p.id ? { ...x, stock: Math.max(0, Number(e.target.value)) } : x,
                      ),
                    )
                  }
                  onBlur={(e) => void salveazaStoc(p, Math.max(0, Number(e.target.value)))}
                />
              </td>
              <td className="px-4 py-3">{p.minStock}</td>
              <td className="px-4 py-3">
                <Pill
                  tone={
                    status === "in_stoc" ? "mint" : status === "stoc_limitat" ? "peach" : "danger"
                  }
                >
                  {status === "stoc_limitat" ? "Stoc redus" : STOCK_LABELS[status]}
                </Pill>
              </td>
            </tr>
          );
        })}
      </AdminTable>
    </AdminShell>
  );
}
