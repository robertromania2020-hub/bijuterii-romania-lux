import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { departments, products } from "@/data/catalog";
import { resolveImage } from "@/lib/asset-map";
import {
  deleteRow,
  mapCategory,
  slugify,
  updateRow,
  upsertRow,
  useLiveTable,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/categorii")({
  head: () => ({
    meta: [
      { title: "Categorii — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea categoriilor de produse." },
      { property: "og:title", content: "Categorii — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Categoriile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCategorii,
});

function AdminCategorii() {
  const { rows: list, loading, error } = useLiveTable("categories", mapCategory, {
    column: "position",
    ascending: true,
  });
  const [name, setName] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [image, setImage] = useState("");

  const dep = departmentSlug || departments[0]?.slug || "";

  async function add() {
    const trimmed = name.trim();
    if (!trimmed || !dep) {
      toast.error("Introdu denumirea categoriei și alege departamentul.");
      return;
    }
    const slug = slugify(trimmed);
    if (list.some((c) => c.slug === slug)) {
      toast.error("Această categorie există deja.");
      return;
    }
    try {
      await upsertRow("categories", {
        id: `c-${slug}`,
        slug,
        name: trimmed,
        department_slug: dep,
        image: image.trim(),
        tone: "lilac",
        active: true,
        position: list.length + 1,
      });
      setName("");
      setImage("");
      toast.success("Categorie adăugată");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată.");
    }
  }

  return (
    <AdminShell
      title="Categorii"
      description="Structura de categorii afișată în magazin. Modificările se salvează în baza de date."
    >
      <div className="mb-6 grid gap-3 rounded-3xl border border-border bg-surface p-4 lg:grid-cols-4 lg:items-end">
        <div>
          <label htmlFor="cat-nume" className="text-sm font-semibold">
            Denumire
          </label>
          <input
            id="cat-nume"
            className="field mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Brățări"
          />
        </div>
        <div>
          <label htmlFor="cat-dep" className="text-sm font-semibold">
            Departament
          </label>
          <select
            id="cat-dep"
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
        <ImageUploadField
          id="cat-imagine"
          label="Imagine"
          kind="categories"
          value={image}
          onChange={setImage}
        />
        <button type="button" className="btn-dark" onClick={() => void add()}>
          Adaugă categorie
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-muted-foreground">Se încarcă…</p> : null}

      <AdminTable
        head={["Categorie", "Slug", "Departament", "Produse", "Status", "Acțiuni"]}
        caption="Categorii"
      >
        {list.map((c) => (
          <tr key={c.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={resolveImage(c.image)}
                  alt=""
                  loading="lazy"
                  width={80}
                  height={80}
                  className="size-10 rounded-xl object-cover"
                />
                <span className="font-semibold">{c.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{c.slug}</td>
            <td className="px-4 py-3">
              {departments.find((d) => d.slug === c.departmentSlug)?.name ?? c.departmentSlug}
            </td>
            <td className="px-4 py-3">
              {products.filter((p) => p.categorySlug === c.slug).length}
            </td>
            <td className="px-4 py-3">
              <Pill tone={c.active ? "mint" : "muted"}>{c.active ? "Activă" : "Inactivă"}</Pill>
            </td>
            <td className="space-x-4 px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={() => {
                  void updateRow("categories", c.id, { active: !c.active })
                    .then(() => toast.success("Categorie actualizată"))
                    .catch((err: Error) => toast.error(err.message));
                }}
              >
                {c.active ? "Dezactivează" : "Activează"}
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-destructive"
                onClick={() => {
                  if (products.some((p) => p.categorySlug === c.slug)) {
                    toast.error("Categoria are produse asociate.");
                    return;
                  }
                  void deleteRow("categories", c.id)
                    .then(() => toast.success("Categorie ștearsă"))
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
