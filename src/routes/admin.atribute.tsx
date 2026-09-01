import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { departments, getCategory } from "@/data/catalog";
import { ATTRIBUTE_TYPE_LABELS, type AttributeType } from "@/data/types";
import {
  deleteRow,
  mapAttributeDefinition,
  slugify,
  updateRow,
  upsertRow,
  useLiveTable,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/atribute")({
  head: () => ({
    meta: [
      { title: "Atribute — Administrare | BIJUTERII" },
      { name: "description", content: "Definirea atributelor dinamice pentru produse." },
      { property: "og:title", content: "Atribute — Administrare | BIJUTERII" },
      { property: "og:description", content: "Atributele produselor." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAtribute,
});

function AdminAtribute() {
  const { rows: list, loading, error } = useLiveTable(
    "attribute_definitions",
    mapAttributeDefinition,
    { column: "position", ascending: true },
  );
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("select");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [options, setOptions] = useState("");

  const dep = departmentSlug || departments[0]?.slug || "";

  async function add() {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Introdu denumirea atributului.");
      return;
    }
    const key = slugify(trimmed, "_");
    if (list.some((a) => a.key === key && a.departmentSlug === dep)) {
      toast.error("Acest atribut există deja în departament.");
      return;
    }
    try {
      await upsertRow("attribute_definitions", {
        id: `attr-${dep}-${key}`,
        key,
        label: trimmed,
        type,
        options: options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        department_slug: dep || null,
        category_slugs: [],
        filterable: type === "select" || type === "multi",
        show_on_product: true,
        unit: null,
        position: list.length + 1,
      });
      setLabel("");
      setOptions("");
      toast.success("Atribut adăugat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată.");
    }
  }

  return (
    <AdminShell
      title="Atribute produse"
      description="Atributele se aplică pe departament sau pe categorii și pot fi folosite ca filtre în magazin. Modificările se salvează în baza de date."
    >
      <div className="mb-6 grid gap-3 rounded-3xl border border-border bg-surface p-4 lg:grid-cols-5 lg:items-end">
        <div>
          <label htmlFor="attr-label" className="text-sm font-semibold">
            Denumire
          </label>
          <input
            id="attr-label"
            className="field mt-1.5"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex. SPF"
          />
        </div>
        <div>
          <label htmlFor="attr-tip" className="text-sm font-semibold">
            Tip
          </label>
          <select
            id="attr-tip"
            className="field mt-1.5"
            value={type}
            onChange={(e) => setType(e.target.value as AttributeType)}
          >
            {(Object.keys(ATTRIBUTE_TYPE_LABELS) as AttributeType[]).map((t) => (
              <option key={t} value={t}>
                {ATTRIBUTE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attr-dep" className="text-sm font-semibold">
            Departament
          </label>
          <select
            id="attr-dep"
            className="field mt-1.5"
            value={dep}
            onChange={(e) => setDepartmentSlug(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="attr-optiuni" className="text-sm font-semibold">
            Opțiuni (separate prin virgulă)
          </label>
          <input
            id="attr-optiuni"
            className="field mt-1.5"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            placeholder="ex. 15, 30, 50"
          />
        </div>
        <button type="button" className="btn-dark" onClick={() => void add()}>
          Adaugă atribut
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-muted-foreground">Se încarcă…</p> : null}

      <AdminTable
        head={[
          "Atribut",
          "Cheie",
          "Tip",
          "Departament",
          "Categorii",
          "Opțiuni",
          "Filtru",
          "Acțiuni",
        ]}
        caption="Atribute produse"
      >
        {list.map((a) => (
          <tr key={a.id}>
            <td className="px-4 py-3 font-semibold">{a.label}</td>
            <td className="px-4 py-3 font-mono text-xs">{a.key}</td>
            <td className="px-4 py-3">{ATTRIBUTE_TYPE_LABELS[a.type]}</td>
            <td className="px-4 py-3">
              {a.departmentSlug
                ? (departments.find((d) => d.slug === a.departmentSlug)?.name ?? a.departmentSlug)
                : "Toate"}
            </td>
            <td className="px-4 py-3 text-muted-foreground">
              {a.categorySlugs.length === 0
                ? "Toate"
                : a.categorySlugs.map((s) => getCategory(s)?.name ?? s).join(", ")}
            </td>
            <td className="max-w-xs px-4 py-3 text-muted-foreground">
              {a.options.length ? a.options.join(", ") : "—"}
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  void updateRow("attribute_definitions", a.id, { filterable: !a.filterable })
                    .then(() =>
                      toast.success(a.filterable ? "Eliminat din filtre" : "Adăugat în filtre"),
                    )
                    .catch((err: Error) => toast.error(err.message));
                }}
              >
                <Pill tone={a.filterable ? "mint" : "muted"}>{a.filterable ? "Da" : "Nu"}</Pill>
              </button>
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-destructive"
                onClick={() => {
                  void deleteRow("attribute_definitions", a.id)
                    .then(() => toast.success("Atribut șters"))
                    .catch((err: Error) => toast.error(err.message));
                }}
              >
                Șterge
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}
