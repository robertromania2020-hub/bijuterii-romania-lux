import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { DISCOUNT_TARGET_LABELS, type Discount } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { mapDiscount, updateDiscountActive, useLiveTable } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/reduceri")({
  head: () => ({
    meta: [
      { title: "Reduceri — Administrare | BIJUTERII" },
      { name: "description", content: "Campanii de reduceri pe produse, categorii și colecții." },
      { property: "og:title", content: "Reduceri — Administrare | BIJUTERII" },
      { property: "og:description", content: "Campanii de reduceri." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminReduceri,
});

function AdminReduceri() {
  const { rows, loading, error } = useLiveTable<Discount>("discounts", mapDiscount, {
    column: "starts_at",
    ascending: false,
  });

  async function comuta(d: Discount) {
    try {
      await updateDiscountActive(d.id, !d.active);
      toast.success(d.active ? "Campanie dezactivată" : "Campanie activată");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Modificarea nu a putut fi salvată.");
    }
  }

  return (
    <AdminShell
      title="Reduceri"
      description="Campanii aplicate produselor, categoriilor sau colecțiilor."
    >
      {error && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă campaniile…</p>}

      <AdminTable
        head={["Campanie", "Tip", "Valoare", "Se aplică la", "Perioadă", "Status"]}
        caption="Campanii de reduceri"
      >
        {rows.map((d) => (
          <tr key={d.id}>
            <td className="px-4 py-3 font-semibold">{d.name}</td>
            <td className="px-4 py-3">{d.type === "procent" ? "Procent" : "Sumă fixă"}</td>
            <td className="px-4 py-3">{d.type === "procent" ? `${d.value}%` : formatPrice(d.value)}</td>
            <td className="px-4 py-3 text-muted-foreground">
              {DISCOUNT_TARGET_LABELS[d.targetType]}: {d.targetSlug}
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {formatDate(d.startsAt)} – {formatDate(d.endsAt)}
            </td>
            <td className="px-4 py-3">
              <button type="button" onClick={() => void comuta(d)}>
                <Pill tone={d.active ? "mint" : "muted"}>{d.active ? "Activă" : "Inactivă"}</Pill>
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}
