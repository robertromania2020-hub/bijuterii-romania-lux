import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { products } from "@/data/catalog";
import { resolveImage } from "@/lib/asset-map";
import { deleteRow, mapBrand, slugify, updateRow, upsertRow, useLiveTable } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/branduri")({
  head: () => ({
    meta: [
      { title: "Branduri — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea brandurilor din catalog." },
      { property: "og:title", content: "Branduri — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Brandurile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminBranduri,
});

function AdminBranduri() {
  const { rows: list, loading, error } = useLiveTable("brands", mapBrand, {
    column: "position",
    ascending: true,
  });
  const [name, setName] = useState("");
  const [logo, setLogo] = useState("");

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Introdu numele brandului.");
      return;
    }
    const slug = slugify(trimmed);
    if (list.some((b) => b.slug === slug)) {
      toast.error("Acest brand există deja.");
      return;
    }
    try {
      await upsertRow("brands", {
        id: `b-${slug}`,
        slug,
        name: trimmed,
        logo: logo.trim() || null,
        active: true,
        position: list.length + 1,
      });
      setName("");
      setLogo("");
      toast.success("Brand adăugat");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Salvare eșuată.");
    }
  }

  return (
    <AdminShell
      title="Branduri"
      description="Brandurile disponibile pentru produsele din orice departament. Modificările se salvează în baza de date."
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
        <div className="min-w-[240px] flex-1">
          <ImageUploadField
            id="brand-logo"
            label="Logo"
            kind="brands"
            value={logo}
            onChange={setLogo}
          />
        </div>
        <button type="button" className="btn-dark" onClick={() => void add()}>
          Adaugă brand
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      {loading ? <p className="mb-4 text-sm text-muted-foreground">Se încarcă…</p> : null}

      <AdminTable head={["Brand", "Slug", "Produse", "Status", "Acțiuni"]} caption="Branduri">
        {list.map((b) => (
          <tr key={b.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {b.logo ? (
                  <img
                    src={resolveImage(b.logo)}
                    alt=""
                    loading="lazy"
                    width={80}
                    height={80}
                    className="size-10 rounded-xl object-cover"
                  />
                ) : null}
                <span className="font-semibold">{b.name}</span>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{b.slug}</td>
            <td className="px-4 py-3">{products.filter((p) => p.brandSlug === b.slug).length}</td>
            <td className="px-4 py-3">
              <Pill tone={b.active ? "mint" : "muted"}>{b.active ? "Activ" : "Inactiv"}</Pill>
            </td>
            <td className="space-x-4 px-4 py-3">
              <button
                type="button"
                className="text-sm font-semibold text-primary"
                onClick={() => {
                  void updateRow("brands", b.id, { active: !b.active })
                    .then(() => toast.success(b.active ? "Brand dezactivat" : "Brand activat"))
                    .catch((err: Error) => toast.error(err.message));
                }}
              >
                {b.active ? "Dezactivează" : "Activează"}
              </button>
              <button
                type="button"
                className="text-sm font-semibold text-destructive"
                onClick={() => {
                  if (products.some((p) => p.brandSlug === b.slug)) {
                    toast.error("Brandul are produse asociate.");
                    return;
                  }
                  void deleteRow("brands", b.id)
                    .then(() => toast.success("Brand șters"))
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
