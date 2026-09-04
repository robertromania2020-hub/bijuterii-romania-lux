import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
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

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("Introdu o adresă de email validă.");
      return;
    }
    setError(null);
    setEmail("");
    toast.success("Îți mulțumim! Abonarea va fi salvată după conectarea bazei de date.");
  }

  return (
    <footer className="mt-12 rounded-t-[2.5rem] bg-foreground px-4 py-10 text-background/80">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2rem] bg-mint p-6 text-foreground">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Abonează-te la newsletter
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Primești noutăți și oferte exclusive.
          </p>
          <form onSubmit={subscribe} className="mt-4 flex flex-col gap-2 sm:flex-row" noValidate>
            <label htmlFor="newsletter-email" className="sr-only">
              Adresa ta de email
            </label>
            <input
              id="newsletter-email"
              type="email"
              className="field flex-1"
              placeholder="Introdu adresa ta de email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "newsletter-eroare" : undefined}
            />
            <button type="submit" className="btn-dark shrink-0">
              Abonează-te
            </button>
          </form>
          {error && (
            <p id="newsletter-eroare" className="mt-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </section>

        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-base font-semibold text-background">{SHOP_NAME}</p>
            <p className="mt-2 text-sm leading-relaxed text-background/60">
              Bijuterii, ceasuri, parfumuri și machiaj, alese cu grijă pentru purtare zilnică.
            </p>
            <ul className="mt-3 space-y-1 text-xs leading-relaxed text-background/55">
              <li className="flex items-start gap-2">
                <Building2 className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {LEGAL_NAME}
                  <br />
                  CUI: {CUI}
                  <br />
                  Nr. Reg. Com.: {REG_COM}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                <span>Sediu: {COMPANY_ADDRESS}</span>
              </li>
            </ul>
          </div>
          <nav aria-label="Informații">
            <p className="text-sm font-semibold text-background">Informații</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link to="/despre-noi" className="hover:underline">
                  Despre noi
                </Link>
              </li>
              <li>
                <Link to="/livrare" className="hover:underline">
                  Livrare
                </Link>
              </li>
              <li>
                <Link to="/politica-de-retur" className="hover:underline">
                  Politica de retur
                </Link>
              </li>
              <li>
                <Link to="/intrebari-frecvente" className="hover:underline">
                  Întrebări frecvente
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="text-sm font-semibold text-background">Legal</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link to="/termeni-si-conditii" className="hover:underline">
                  Termeni și condiții
                </Link>
              </li>
              <li>
                <Link to="/politica-de-confidentialitate" className="hover:underline">
                  Politica de confidențialitate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:underline">
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-background">Contact</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm text-background/70">
              <li className="flex items-center gap-2">
                <Phone className="size-4" aria-hidden="true" />
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
              <li>Program: {WORKING_HOURS}</li>
            </ul>
            <div className="mt-3 flex gap-3">
              <a href="#" aria-label="Instagram" className="hover:text-background">
                <Instagram className="size-5" />
              </a>
              <a href="#" aria-label="Facebook" className="hover:text-background">
                <Facebook className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-background/15 pt-5">
          <span className="font-display font-semibold text-background">{SHOP_NAME}</span>
          <span className="font-mono text-xs text-background/50">
            © 2026 {LEGAL_NAME} · Toate drepturile rezervate
          </span>
        </div>
      </div>
    </footer>
  );
}
