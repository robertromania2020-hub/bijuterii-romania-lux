import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

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
            <p className="font-display text-base font-semibold text-background">Casa Elegantei</p>
            <p className="mt-2 text-sm leading-relaxed text-background/60">
              Bijuterii din oțel inoxidabil și bijuterii placate cu aur, create pentru purtare
              zilnică.
            </p>
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
                <Phone className="size-4" aria-hidden="true" /> 0774 570 743
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" /> eleganteicasa10@gmail.com
              </li>
              <li>Program: Luni–Vineri, 09:00–18:00</li>
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
          <span className="font-display font-semibold text-background">Casa Elegantei</span>
          <span className="font-mono text-xs text-background/50">
            © 2026 Casa Elegantei · Toate drepturile rezervate
          </span>
        </div>
      </div>
    </footer>
  );
}
