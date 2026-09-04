import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";

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
          <h2 className="font-display text-lg font-semibold">Date de contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="size-4" aria-hidden="true" /> 0774 570 743
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4" aria-hidden="true" /> eleganteicasa10@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4" aria-hidden="true" /> Luni–Vineri, 09:00–18:00
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4" aria-hidden="true" /> București, România
            </li>
          </ul>
        </aside>
      </div>
    </SiteLayout>
  );
}
