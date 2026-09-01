import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { categoriesOf, products } from "@/data/catalog";
import { resolveImage } from "@/lib/asset-map";
import {
  deleteRow,
  mapDepartment,
  slugify,
  updateRow,
  upsertRow,
  useLiveTable,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/departamente")({
  head: () => ({
    meta: [
      { title: "Departamente — Administrare | BIJUTERII" },
      { name: "description", content: "Gestionarea departamentelor magazinului." },
      { property: "og:title", content: "Departamente — Administrare | BIJUTERII" },
      { property: "og:description", content: "Departamentele magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDepartamente,
});

function AdminDepartamente() {
  const { rows: list, loading, error } = useLiveTable("departments", mapDepartment, {
    column: "position",
    ascending: true,
  });
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Introdu denumirea departamentului.");
      return;
    }
    const slug = slugify(trimmed);
    if (list.some((d) => d.slug === slug)) {
      toast.error("Acest departament există deja.");
      return;
    }
    try {
      await upsertRow("departments", {
        id: `d-${slug}`,
        slug,
        name: trimmed,
        description: description.trim(),
        image: "",
        tone: "lilac",
        active: true,
        position: list.length + 1,
      });
      setName("");
      setDescription("");
      toast.success("Departament adăugat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată.");
    }
  }

  return (
    <AdminShell
      title="Departamente"
      description="Departamentele grupează categoriile și produsele. Modificările se salvează în baza de date."
    >
      <div className="mb-6 grid gap-3 rounded-3xl border border-border bg-surface p-4 lg:grid-cols-3 lg:items-end">
        <div>
          <label htmlFor="dep-nume" className="text-sm font-semibold">
            Denumire
          </label>
          <input
            id="dep-nume"
            className="field mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Îngrijire"
          />
        </div>
        <div>
          <label htmlFor="dep-descriere" className="text-sm font-semibold">
            Descriere
          </label>
          <input
            id="dep-descriere"
            className="field mt-1.5"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Text scurt afișat în magazin"
          />
        </div>
        <button type="button" className="btn-dark" onClick={() => void add()}>
          Adaugă departament
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-muted-foreground">Se încarcă…</p> : null}

      <AdminTable
        head={["Departament", "Slug", "Categorii", "Produse", "Status", "Acțiuni"]}
        caption="Departamente"
      >
        {list.map((d) => (
          <tr key={d.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={resolveImage(d.image)}
                  alt=""
                  loading="lazy"
                  width={80}
                  height={80}
                  className="size-10 rounded-xl object-cover"
                />
                <span className="font-semibold">{d.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{d.slug}</td>
            <td className="px-4 py-3">{categoriesOf(d.slug).length}</td>
            <td className="px-4 py-3">
              {products.filter((p) => p.departmentSlug === d.slug).length}
            </td>
            <td className="px-4 py-3">
              <Pill tone={d.active ? "mint" : "muted"}>{d.active ? "Activ" : "Inactiv"}</Pill>
            </td>
            <td className="space-x-4 px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={() => {
                  void updateRow("departments", d.id, { active: !d.active })
                    .then(() => toast.success("Departament actualizat"))
                    .catch((err: Error) => toast.error(err.message));
                }}
              >
                {d.active ? "Dezactivează" : "Activează"}
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-destructive"
                onClick={() => {
                  if (products.some((p) => p.departmentSlug === d.slug)) {
                    toast.error("Departamentul are produse asociate.");
                    return;
                  }
                  void deleteRow("departments", d.id)
                    .then(() => toast.success("Departament șters"))
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
