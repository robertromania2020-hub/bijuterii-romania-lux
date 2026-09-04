import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminCard, AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/setari")({
  head: () => ({
    meta: [
      { title: "Setări — Administrare | Casa Elegantei" },
      { name: "description", content: "Setările magazinului: livrare, plată și contact." },
      { property: "og:title", content: "Setări — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Setările magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminSetari,
});

function AdminSetari() {
  return (
    <AdminShell title="Setări" description="Configurări generale ale magazinului.">
      <form
        className="grid gap-4 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          toast.info("Setările vor fi salvate după conectarea bazei de date.");
        }}
      >
        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Date magazin</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="s-nume" className="text-sm font-semibold">Nume magazin</label>
              <input id="s-nume" className="field mt-1.5" defaultValue="Casa Elegantei" />
            </div>
            <div>
              <label htmlFor="s-email" className="text-sm font-semibold">Email contact</label>
              <input id="s-email" type="email" className="field mt-1.5" defaultValue="eleganteicasa10@gmail.com" />
            </div>
            <div>
              <label htmlFor="s-telefon" className="text-sm font-semibold">Telefon</label>
              <input id="s-telefon" className="field mt-1.5" defaultValue="+40 721 000 000" />
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Livrare și plată</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="s-cost" className="text-sm font-semibold">Cost livrare standard (lei)</label>
              <input id="s-cost" type="number" min={0} className="field mt-1.5" defaultValue={20} />
            </div>
            <div>
              <label htmlFor="s-prag" className="text-sm font-semibold">Prag livrare gratuită (lei)</label>
              <input id="s-prag" type="number" min={0} className="field mt-1.5" defaultValue={250} />
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">Metode de plată acceptate</legend>
              <div className="mt-2 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4 accent-primary" defaultChecked /> Card online
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4 accent-primary" defaultChecked /> Ramburs la livrare
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="size-4 accent-primary" /> Transfer bancar
                </label>
              </div>
            </fieldset>
          </div>
        </AdminCard>

        <div className="lg:col-span-2">
          <button type="submit" className="btn-dark">Salvează setările</button>
        </div>
      </form>
    </AdminShell>
  );
}
