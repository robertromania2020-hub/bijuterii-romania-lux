import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";
import {
  COMPANY_ADDRESS,
  CUI,
  EMAIL,
  EMAIL_HREF,
  LEGAL_NAME,
  PHONE,
  PHONE_HREF,
  REG_COM,
  SHOP_NAME,
  WORKING_HOURS,
} from "@/data/company";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — echipa Casa Elegantei" },
      {
        name: "description",
        content:
          "Ia legătura cu echipa Casa Elegantei: telefon, email, program de lucru și formular de contact.",
      },
      { property: "og:title", content: "Contact | Casa Elegantei" },
      { property: "og:description", content: "Telefon, email și formular de contact." },
    ],
  }),
  component: ContactPage,
});

interface Errors {
  nume?: string;
  email?: string;
  mesaj?: string;
}

function ContactPage() {
  const [form, setForm] = useState({ nume: "", email: "", mesaj: "" });
  const [errors, setErrors] = useState<Errors>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (form.nume.trim().length < 2) next.nume = "Introdu numele tău.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = "Introdu o adresă de email validă.";
    if (form.mesaj.trim().length < 10) next.mesaj = "Mesajul trebuie să aibă minim 10 caractere.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setForm({ nume: "", email: "", mesaj: "" });
    toast.success("Mesajul va fi trimis după conectarea bazei de date.");
  }

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Suntem aici"
        title="Contact"
        description="Scrie-ne și îți răspundem în cel mult 24 de ore lucrătoare."
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <form onSubmit={submit} className="rounded-3xl border border-border bg-surface p-5" noValidate>
          <div>
            <label htmlFor="contact-nume" className="text-sm font-semibold">
              Nume și prenume
            </label>
            <input
              id="contact-nume"
              className="field mt-2"
              value={form.nume}
              onChange={(e) => setForm({ ...form, nume: e.target.value })}
              aria-invalid={!!errors.nume}
            />
            {errors.nume && <p className="mt-1 text-sm text-destructive">{errors.nume}</p>}
          </div>
          <div className="mt-4">
            <label htmlFor="contact-email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              className="field mt-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="mt-4">
            <label htmlFor="contact-mesaj" className="text-sm font-semibold">
              Mesaj
            </label>
            <textarea
              id="contact-mesaj"
              rows={6}
              className="field mt-2"
              value={form.mesaj}
              onChange={(e) => setForm({ ...form, mesaj: e.target.value })}
              aria-invalid={!!errors.mesaj}
            />
            {errors.mesaj && <p className="mt-1 text-sm text-destructive">{errors.mesaj}</p>}
          </div>
          <button type="submit" className="btn-dark mt-5">
            Trimite mesajul
          </button>
        </form>

        <aside className="rounded-3xl bg-mint p-5">
          <h2 className="font-display text-lg font-semibold">{SHOP_NAME}</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <a href={PHONE_HREF} className="hover:underline">
                {PHONE}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <a href={EMAIL_HREF} className="break-all hover:underline">
                {EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0" aria-hidden="true" /> {WORKING_HOURS}
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {COMPANY_ADDRESS}
            </li>
          </ul>
          <div className="mt-5 border-t border-foreground/10 pt-4 text-xs leading-relaxed text-muted-foreground">
            <p className="font-semibold text-foreground">{LEGAL_NAME}</p>
            <p className="mt-1">CUI: {CUI}</p>
            <p>Nr. Registrul Comerțului: {REG_COM}</p>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
