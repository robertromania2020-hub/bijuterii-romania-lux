import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { departments, products } from "@/data/catalog";
import { resolveImage } from "@/lib/asset-map";
import {
  deleteRow,
  mapCollection,
  slugify,
  upsertRow,
  useLiveTable,
} from "@/lib/admin-data";

export const Route = createFileRoute("/admin/colectii")({
  head: () => ({
    meta: [
      { title: "Colecții — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea colecțiilor de produse." },
      { property: "og:title", content: "Colecții — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Colecțiile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminColectii,
});

function AdminColectii() {
  const { rows: list, loading, error } = useLiveTable("collections", mapCollection, {
    column: "position",
    ascending: true,
  });
  const [name, setName] = useState("");
  const [departmentSlug, setDepartmentSlug] = useState("");
  const [image, setImage] = useState("");

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Introdu denumirea colecției.");
      return;
    }
    const slug = slugify(trimmed);
    if (list.some((c) => c.slug === slug)) {
      toast.error("Această colecție există deja.");
      return;
    }
    try {
      await upsertRow("collections", {
        id: `col-${slug}`,
        slug,
        name: trimmed,
        description: "",
        image: image.trim(),
        department_slug: departmentSlug || null,
        active: true,
        position: list.length + 1,
      });
      setName("");
      setImage("");
      toast.success("Colecție adăugată");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată.");
    }
  }

  return (
    <AdminShell
      title="Colecții"
      description="Colecțiile grupează produse din unul sau mai multe departamente. Modificările se salvează în baza de date."
    >
      <div className="mb-6 grid gap-3 rounded-3xl border border-border bg-surface p-4 lg:grid-cols-4 lg:items-end">
        <div>
          <label htmlFor="col-nume" className="text-sm font-semibold">
            Denumire
          </label>
          <input
            id="col-nume"
            className="field mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. Colecția de toamnă"
          />
        </div>
        <div>
          <label htmlFor="col-dep" className="text-sm font-semibold">
            Departament
          </label>
          <select
            id="col-dep"
            className="field mt-1.5"
            value={departmentSlug}
            onChange={(e) => setDepartmentSlug(e.target.value)}
          >
            <option value="">Toate</option>
            {departments.map((d) => (
              <option key={d.id} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <ImageUploadField
          id="col-imagine"
          label="Imagine"
          kind="collections"
          value={image}
          onChange={setImage}
        />
        <button type="button" className="btn-dark" onClick={() => void add()}>
          Adaugă colecție
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-muted-foreground">Se încarcă…</p> : null}

      <AdminTable
        head={["Colecție", "Slug", "Departament", "Produse", "Acțiuni"]}
        caption="Colecții"
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
              {c.departmentSlug
                ? (departments.find((d) => d.slug === c.departmentSlug)?.name ?? c.departmentSlug)
                : "Toate"}
            </td>
            <td className="px-4 py-3">
              {products.filter((p) => p.collectionSlug === c.slug).length}
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-destructive"
                onClick={() => {
                  if (products.some((p) => p.collectionSlug === c.slug)) {
                    toast.error("Colecția are produse asociate.");
                    return;
                  }
                  void deleteRow("collections", c.id)
                    .then(() => toast.success("Colecție ștearsă"))
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
