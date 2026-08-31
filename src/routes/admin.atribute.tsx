import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { attributeDefinitions as seed, departments, getCategory } from "@/data/catalog";
import { ATTRIBUTE_TYPE_LABELS, type AttributeType } from "@/data/types";

export const Route = createFileRoute("/admin/atribute")({
  head: () => ({
    meta: [
      { title: "Atribute produse — Administrare | BIJUTERII" },
      {
        name: "description",
        content: "Definirea atributelor specifice fiecărui departament și fiecărei categorii.",
      },
      { property: "og:title", content: "Atribute produse — Administrare | BIJUTERII" },
      { property: "og:description", content: "Atributele produselor." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminAtribute,
});

function AdminAtribute() {
  const [list, setList] = useState(seed);
  const [label, setLabel] = useState("");
  const [type, setType] = useState<AttributeType>("select");
  const [departmentSlug, setDepartmentSlug] = useState<string>(departments[0]!.slug);
  const [options, setOptions] = useState("");

  function add() {
    const trimmed = label.trim();
    if (!trimmed) {
      toast.error("Introdu denumirea atributului.");
      return;
    }
    const key = trimmed
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
    setList((prev) => [
      ...prev,
      {
        id: `a${Date.now()}`,
        key,
        label: trimmed,
        type,
        options: options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        departmentSlug,
        categorySlugs: [],
        filterable: type === "select" || type === "multi",
        showOnProduct: true,
        position: prev.length + 1,
      },
    ]);
    setLabel("");
    setOptions("");
    toast.success("Atribut adăugat");
  }

  return (
    <AdminShell
      title="Atribute produse"
      description="Atributele se aplică pe departament sau pe categorii și pot fi folosite ca filtre în magazin."
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
            value={departmentSlug}
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
        <button type="button" className="btn-dark" onClick={add}>
          Adaugă atribut
        </button>
      </div>

      <AdminTable
        head={["Atribut", "Cheie", "Tip", "Departament", "Categorii", "Opțiuni", "Filtru"]}
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
                  setList((prev) =>
                    prev.map((x) => (x.id === a.id ? { ...x, filterable: !x.filterable } : x)),
                  );
                  toast.success(a.filterable ? "Eliminat din filtre" : "Adăugat în filtre");
                }}
              >
                <Pill tone={a.filterable ? "mint" : "muted"}>{a.filterable ? "Da" : "Nu"}</Pill>
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  );
}
