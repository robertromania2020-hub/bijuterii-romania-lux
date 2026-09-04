import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { STOCK_LABELS, stockStatus, type Product } from "@/data/types";
import { adjustStock, mapProduct, useLiveTable } from "@/lib/admin-data";
import { mesajEroare } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/stoc")({
  head: () => ({
    meta: [
      { title: "Stoc — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea stocurilor și avertizări pentru stoc redus." },
      { property: "og:title", content: "Stoc — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Stocuri și alerte." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminStoc,
});

interface Rand {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  sku: string;
  variantLabel: string;
  stock: number;
  minStock: number;
}

function randuri(products: Product[]): Rand[] {
  const out: Rand[] = [];
  for (const p of products) {
    if (p.variants.length === 0) {
      out.push({
        key: p.id,
        productId: p.id,
        variantId: null,
        name: p.name,
        sku: p.sku,
        variantLabel: "—",
        stock: p.stock,
        minStock: p.minStock,
      });
    } else {
      for (const v of p.variants) {
        out.push({
          key: `${p.id}:${v.id}`,
          productId: p.id,
          variantId: v.id,
          name: p.name,
          sku: v.sku || p.sku,
          variantLabel: `${v.attributeLabel}: ${v.label}`,
          stock: v.stock,
          minStock: p.minStock,
        });
      }
    }
  }
  return out;
}

function AdminStoc() {
  const { rows, loading, error, reload } = useLiveTable<Product>("products", mapProduct, {
    column: "name",
    ascending: true,
  });
  const [valori, setValori] = useState<Record<string, number>>({});
  const [salveaza, setSalveaza] = useState<string | null>(null);

  const linii = randuri(rows);
  const alerte = linii.filter(
    (l) => stockStatus({ stock: l.stock, minStock: l.minStock }) !== "in_stoc",
  );

  async function salveazaStoc(l: Rand, cantitate: number) {
    if (cantitate === l.stock) return;
    setSalveaza(l.key);
    try {
      await adjustStock(l.productId, l.variantId, cantitate, "Ajustare manuală");
      toast.success(`Stoc actualizat pentru ${l.name}`);
      setValori((v) => {
        const next = { ...v };
        delete next[l.key];
        return next;
      });
      await reload();
    } catch (err) {
      toast.error(mesajEroare(err, "Stocul nu a putut fi salvat."));
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
        head={["Produs", "SKU", "Variantă", "Stoc", "Prag stoc redus", "Status"]}
        caption="Situația stocurilor"
      >
        {linii.map((l) => {
          const status = stockStatus({ stock: l.stock, minStock: l.minStock });
          const valoare = valori[l.key] ?? l.stock;
          return (
            <tr key={l.key}>
              <td className="px-4 py-3 font-semibold">{l.name}</td>
              <td className="px-4 py-3 font-mono text-xs">{l.sku}</td>
              <td className="px-4 py-3 text-muted-foreground">{l.variantLabel}</td>
              <td className="px-4 py-3">
                <label className="sr-only" htmlFor={`stoc-${l.key}`}>
                  Stoc pentru {l.name}
                </label>
                <input
                  id={`stoc-${l.key}`}
                  type="number"
                  min={0}
                  disabled={salveaza === l.key}
                  className="field w-24"
                  value={valoare}
                  onChange={(e) =>
                    setValori((v) => ({ ...v, [l.key]: Math.max(0, Number(e.target.value)) }))
                  }
                  onBlur={(e) => void salveazaStoc(l, Math.max(0, Number(e.target.value)))}
                />
              </td>
              <td className="px-4 py-3">{l.minStock}</td>
              <td className="px-4 py-3">
                <Pill
                  tone={status === "in_stoc" ? "mint" : status === "stoc_limitat" ? "peach" : "danger"}
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
