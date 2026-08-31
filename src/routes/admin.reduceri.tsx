import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { discounts as seed } from "@/data/catalog";
import { formatDate, formatPrice } from "@/lib/format";

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
  const [list, setList] = useState(seed);

  return (
    <AdminShell
      title="Reduceri"
      description="Campanii aplicate produselor, categoriilor sau colecțiilor."
      actions={<button className="btn-dark">Adaugă campanie</button>}
    >
      <AdminTable
        head={["Campanie", "Tip", "Valoare", "Se aplică la", "Perioadă", "Status"]}
        caption="Campanii de reduceri"
      >
        {list.map((d) => (
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
              <button
                type="button"
                onClick={() => {
                  setList((prev) =>
                    prev.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)),
                  );
                  toast.success(d.active ? "Campanie dezactivată" : "Campanie activată");
                }}
              >
                <Pill tone={d.active ? "mint" : "muted"}>{d.active ? "Activă" : "Inactivă"}</Pill>
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}
