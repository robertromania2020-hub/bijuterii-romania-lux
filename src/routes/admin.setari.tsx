import { createFileRoute } from "@tanstack/react-router";
import { AdminCard, AdminShell } from "@/components/admin/AdminShell";
import {
  COMPANY_ADDRESS,
  CUI,
  EMAIL,
  EMAIL_HREF,
  LEGAL_NAME,
  PHONE,
  PHONE_HREF,
  REG_COM,
  SHIPPING_COST,
  SHOP_NAME,
  SHOP_TAGLINE,
  WORKING_HOURS,
} from "@/data/company";
import { formatPrice } from "@/lib/format";

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

function Rand({ eticheta, children }: { eticheta: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted-foreground">{eticheta}</dt>
      <dd className="text-sm font-semibold sm:text-right">{children}</dd>
    </div>
  );
}

function AdminSetari() {
  return (
    <AdminShell
      title="Setări"
      description="Datele oficiale ale magazinului, folosite pe întregul site."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Date magazin</h2>
          <dl className="mt-4 space-y-3">
            <Rand eticheta="Nume comercial">{SHOP_NAME}</Rand>
            <Rand eticheta="Descriere">{SHOP_TAGLINE}</Rand>
            <Rand eticheta="Denumire legală">{LEGAL_NAME}</Rand>
            <Rand eticheta="CUI">{CUI}</Rand>
            <Rand eticheta="Nr. Reg. Comerțului">{REG_COM}</Rand>
            <Rand eticheta="Sediu social">{COMPANY_ADDRESS}</Rand>
          </dl>
        </AdminCard>

        <AdminCard>
          <h2 className="font-display text-lg font-semibold">Contact și livrare</h2>
          <dl className="mt-4 space-y-3">
            <Rand eticheta="Telefon">
              <a href={PHONE_HREF} className="hover:underline">
                {PHONE}
              </a>
            </Rand>
            <Rand eticheta="Email">
              <a href={EMAIL_HREF} className="break-all hover:underline">
                {EMAIL}
              </a>
            </Rand>
            <Rand eticheta="Program">{WORKING_HOURS}</Rand>
            <Rand eticheta="Cost livrare standard">{formatPrice(SHIPPING_COST)}</Rand>
            <Rand eticheta="Metode de plată">Card online, ramburs la livrare</Rand>
          </dl>
        </AdminCard>

        <p className="text-xs text-muted-foreground lg:col-span-2">
          Aceste date sunt sursa unică de adevăr pentru site (antet, subsol, pagini legale, facturi
          și calculul transportului). Modificarea lor se face în fișierul de configurare al
          magazinului, iar costul de livrare este aplicat identic și la plasarea comenzii.
        </p>
      </div>
    </AdminShell>
  );
}
