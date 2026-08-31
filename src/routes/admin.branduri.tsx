import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { brands as seed, products } from "@/data/catalog";

export const Route = createFileRoute("/admin/branduri")({
  head: () => ({
    meta: [
      { title: "Branduri — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea brandurilor din catalog." },
      { property: "og:title", content: "Branduri — Administrare | BIJUTERII" },
      { property: "og:description", content: "Brandurile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBranduri,
});

function AdminBranduri() {
  const [list, setList] = useState(seed);
  const [name, setName] = useState("");

  function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Introdu numele brandului.");
      return;
    }
    const slug = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    if (list.some((b) => b.slug === slug)) {
      toast.error("Acest brand există deja.");
      return;
    }
    setList((prev) => [...prev, { id: `b${Date.now()}`, slug, name: trimmed, logo: null, active: true }]);
    setName("");
    toast.success("Brand adăugat");
  }

  return (
    <AdminShell
      title="Branduri"
      description="Brandurile disponibile pentru produsele din orice departament."
    >
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-3xl border border-border bg-surface p-4">
        <div className="min-w-[240px] flex-1">
          <label htmlFor="brand-nou" className="text-sm font-semibold">
            Nume brand
          </label>
          <input
            id="brand-nou"
            className="field mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Rimmel"
          />
        </div>
        <button type="button" className="btn-dark" onClick={add}>
          Adaugă brand
        </button>
      </div>

      <AdminTable head={["Brand", "Slug", "Produse", "Status", "Acțiuni"]} caption="Branduri">
        {list.map((b) => (
          <tr key={b.id}>
            <td className="px-4 py-3 font-semibold">{b.name}</td>
            <td className="px-4 py-3 font-mono text-xs">{b.slug}</td>
            <td className="px-4 py-3">{products.filter((p) => p.brandSlug === b.slug).length}</td>
            <td className="px-4 py-3">
              <Pill tone={b.active ? "mint" : "muted"}>{b.active ? "Activ" : "Inactiv"}</Pill>
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={() => {
                  setList((prev) =>
                    prev.map((x) => (x.id === b.id ? { ...x, active: !x.active } : x)),
                  );
                  toast.success(b.active ? "Brand dezactivat" : "Brand activat");
                }}
              >
                {b.active ? "Dezactivează" : "Activează"}
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}
