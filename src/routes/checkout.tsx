import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeading, SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizare comandă | BIJUTERII" },
      {
        name: "description",
        content: "Completează datele de contact și de livrare pentru a finaliza comanda.",
      },
      { property: "og:title", content: "Finalizare comandă | BIJUTERII" },
      { property: "og:description", content: "Date de contact, livrare și plată." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const JUDETE = [
  "Alba", "Arad", "Argeș", "Bacău", "Bihor", "Bistrița-Năsăud", "Botoșani", "Brăila", "Brașov",
  "București", "Buzău", "Călărași", "Caraș-Severin", "Cluj", "Constanța", "Covasna", "Dâmbovița",
  "Dolj", "Galați", "Giurgiu", "Gorj", "Harghita", "Hunedoara", "Ialomița", "Iași", "Ilfov",
  "Maramureș", "Mehedinți", "Mureș", "Neamț", "Olt", "Prahova", "Sălaj", "Satu Mare", "Sibiu",
  "Suceava", "Teleorman", "Timiș", "Tulcea", "Vâlcea", "Vaslui", "Vrancea",
];

const initialForm = {
  nume: "",
  prenume: "",
  telefon: "",
  email: "",
  judet: "",
  localitate: "",
  adresa: "",
  numar: "",
  bloc: "",
  scara: "",
  apartament: "",
  codPostal: "",
  observatii: "",
  livrare: "curier",
  plata: "ramburs",
};

type FormState = typeof initialForm;
type Errors = Partial<Record<keyof FormState, string>>;

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  autoComplete,
}: {
  id: keyof FormState;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        className="field mt-1.5"
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-eroare` : undefined}
      />
      {error && (
        <p id={`${id}-eroare`} className="mt-1 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckoutPage() {
  const { cartLines, totals, hydrated } = useStore();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});

  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (form.nume.trim().length < 2) next.nume = "Introdu numele.";
    if (form.prenume.trim().length < 2) next.prenume = "Introdu prenumele.";
    if (!/^(\+4)?0[0-9]{9}$/.test(form.telefon.replace(/\s/g, "")))
      next.telefon = "Introdu un număr de telefon valid (ex. 0712 345 678).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email))
      next.email = "Introdu o adresă de email validă.";
    if (!form.judet) next.judet = "Selectează județul.";
    if (form.localitate.trim().length < 2) next.localitate = "Introdu localitatea.";
    if (form.adresa.trim().length < 3) next.adresa = "Introdu adresa (strada).";
    if (form.numar.trim().length < 1) next.numar = "Introdu numărul.";
    if (!/^[0-9]{6}$/.test(form.codPostal.trim()))
      next.codPostal = "Codul poștal are 6 cifre.";

    setErrors(next);
    if (Object.keys(next).length > 0) {
      toast.error("Verifică datele completate.");
      return;
    }
    toast.info(
      "Datele sunt valide. Plasarea comenzii va fi activată după conectarea bazei de date și a plăților.",
    );
  }

  if (hydrated && cartLines.length === 0) {
    return (
      <SiteLayout>
        <PageHeading title="Finalizează comanda" />
        <div className="mt-6">
          <EmptyState
            title="Nu ai produse în coș"
            description="Adaugă produse în coș pentru a putea plasa o comandă."
            action={
              <Link to="/bijuterii" className="btn-dark">
                Vezi bijuteriile
              </Link>
            }
          />
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeading
        title="Finalizează comanda"
        description="Completează datele pentru livrare. Nu se efectuează nicio plată în această etapă."
      />

      <form onSubmit={submit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]" noValidate>
        <div className="space-y-6">
          <fieldset className="rounded-3xl border border-border bg-surface p-5">
            <legend className="px-2 font-display text-lg font-semibold">Date de contact</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="nume" label="Nume" value={form.nume} onChange={set("nume")} error={errors.nume} required autoComplete="family-name" />
              <Field id="prenume" label="Prenume" value={form.prenume} onChange={set("prenume")} error={errors.prenume} required autoComplete="given-name" />
              <Field id="telefon" label="Telefon" value={form.telefon} onChange={set("telefon")} error={errors.telefon} required type="tel" autoComplete="tel" />
              <Field id="email" label="Email" value={form.email} onChange={set("email")} error={errors.email} required type="email" autoComplete="email" />
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-border bg-surface p-5">
            <legend className="px-2 font-display text-lg font-semibold">Adresă de livrare</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="judet" className="text-sm font-semibold">
                  Județ<span className="text-primary"> *</span>
                </label>
                <select
                  id="judet"
                  className="field mt-1.5"
                  value={form.judet}
                  onChange={(e) => set("judet")(e.target.value)}
                  aria-invalid={!!errors.judet}
                >
                  <option value="">Selectează județul</option>
                  {JUDETE.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
                {errors.judet && <p className="mt-1 text-sm text-destructive">{errors.judet}</p>}
              </div>
              <Field id="localitate" label="Localitate" value={form.localitate} onChange={set("localitate")} error={errors.localitate} required />
              <Field id="adresa" label="Adresă (stradă)" value={form.adresa} onChange={set("adresa")} error={errors.adresa} required />
              <Field id="numar" label="Număr" value={form.numar} onChange={set("numar")} error={errors.numar} required />
              <Field id="bloc" label="Bloc" value={form.bloc} onChange={set("bloc")} />
              <Field id="scara" label="Scară" value={form.scara} onChange={set("scara")} />
              <Field id="apartament" label="Apartament" value={form.apartament} onChange={set("apartament")} />
              <Field id="codPostal" label="Cod poștal" value={form.codPostal} onChange={set("codPostal")} error={errors.codPostal} required />
            </div>
            <div className="mt-4">
              <label htmlFor="observatii" className="text-sm font-semibold">
                Observații comandă
              </label>
              <textarea
                id="observatii"
                rows={3}
                className="field mt-1.5"
                value={form.observatii}
                onChange={(e) => set("observatii")(e.target.value)}
              />
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-border bg-surface p-5">
            <legend className="px-2 font-display text-lg font-semibold">Metoda de livrare</legend>
            <div className="space-y-2">
              {[
                { id: "curier", label: "Curier rapid (1–3 zile lucrătoare)", cost: totals.shipping },
                { id: "easybox", label: "Ridicare din Easybox", cost: 14.99 },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center justify-between rounded-2xl border border-border p-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="livrare"
                      className="size-4 accent-primary"
                      checked={form.livrare === opt.id}
                      onChange={() => set("livrare")(opt.id)}
                    />
                    {opt.label}
                  </span>
                  <span className="font-semibold">
                    {opt.cost === 0 ? "Gratuit" : formatPrice(opt.cost)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="rounded-3xl border border-border bg-surface p-5">
            <legend className="px-2 font-display text-lg font-semibold">Metoda de plată</legend>
            <div className="space-y-2">
              {[
                { id: "ramburs", label: "Plata ramburs (la livrare)" },
                { id: "card", label: "Plata online cu cardul" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border p-3 text-sm"
                >
                  <input
                    type="radio"
                    name="plata"
                    className="size-4 accent-primary"
                    checked={form.plata === opt.id}
                    onChange={() => set("plata")(opt.id)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-3 rounded-2xl bg-peach p-3 text-xs">
              Procesarea plăților va fi activată într-o etapă ulterioară. Momentan nu se efectuează
              nicio tranzacție.
            </p>
          </fieldset>
        </div>

        <aside className="h-fit rounded-3xl border border-border bg-surface p-5 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Sumar comandă</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {cartLines.map((line) => (
              <li key={`${line.productId}-${line.variant ?? ""}`} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {line.product.name} × {line.quantity}
                </span>
                <span className="shrink-0">{formatPrice(line.product.price * line.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Reducere</dt>
              <dd className="text-primary">-{formatPrice(totals.discount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Transport</dt>
              <dd>{totals.shipping === 0 ? "Gratuit" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd className="font-display">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          <button type="submit" className="btn-dark mt-5 w-full">
            Plasează comanda
          </button>
        </aside>
      </form>
    </SiteLayout>
  );
}
