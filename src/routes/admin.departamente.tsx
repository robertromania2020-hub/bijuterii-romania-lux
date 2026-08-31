import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import { categoriesOf, departments, products } from "@/data/catalog";

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
  component: () => (
    <AdminShell
      title="Departamente"
      description="Departamentele principale ale magazinului. Fiecare departament are propriile categorii și atribute."
      actions={<button className="btn-dark">Adaugă departament</button>}
    >
      <AdminTable
        head={["Departament", "Slug", "Categorii", "Produse", "Poziție", "Status"]}
        caption="Departamente"
      >
        {departments.map((d) => (
          <tr key={d.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={d.image}
                  alt=""
                  loading="lazy"
                  width={80}
                  height={80}
                  className="size-10 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold">{d.name}</p>
                  <p className="max-w-sm text-xs text-muted-foreground">{d.description}</p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs">{d.slug}</td>
            <td className="px-4 py-3">{categoriesOf(d.slug).length}</td>
            <td className="px-4 py-3">
              {products.filter((p) => p.departmentSlug === d.slug).length}
            </td>
            <td className="px-4 py-3">{d.position}</td>
            <td className="px-4 py-3">
              <Pill tone={d.active ? "mint" : "muted"}>{d.active ? "Activ" : "Inactiv"}</Pill>
            </td>
          </tr>
        ))}
      </AdminTable>
    </AdminShell>
  ),
});
