import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { EmptyState, PageHeading, SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/catalog";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import {
  deleteAddress,
  fetchAddresses,
  fetchMyOrders,
  fetchProfile,
  formatShippingAddress,
  mesajEroare,
  saveAddress,
  saveProfile,
  useSession,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  type CustomerAddress,
  type CustomerOrder,
  type Profile,
} from "@/lib/shop-data";


type Tab = "date" | "comenzi" | "adrese" | "favorite";

export const Route = createFileRoute("/cont")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab | undefined } => ({
    tab: (["date", "comenzi", "adrese", "favorite"] as const).includes(search["tab"] as Tab)
      ? (search["tab"] as Tab)
      : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Contul meu | BIJUTERII" },
      {
        name: "description",
        content: "Datele tale personale, comenzile, adresele salvate și produsele favorite.",
      },
      { property: "og:title", content: "Contul meu | BIJUTERII" },
      { property: "og:description", content: "Comenzi, adrese și produse favorite." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ContPage,
});

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "date", label: "Date personale" },
  { id: "comenzi", label: "Comenzile mele" },
  { id: "adrese", label: "Adresele mele" },
  { id: "favorite", label: "Produse favorite" },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  noua: "bg-lilac",
  confirmata: "bg-mint",
  in_procesare: "bg-peach",
  expediata: "bg-mint",
  livrata: "bg-mint",
  anulata: "bg-muted",
  returnata: "bg-muted",
};

/* --------------------------- autentificare --------------------------- */

function Autentificare() {
  const [mod, setMod] = useState<"intra" | "creeaza">("intra");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [prenume, setPrenume] = useState("");
  const [nume, setNume] = useState("");
  const [seLucreaza, setSeLucreaza] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    setSeLucreaza(true);
    try {
      if (mod === "intra") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: parola });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: parola,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: prenume, last_name: nume },
          },
        });
        if (error) throw error;
        toast.success("Cont creat. Verifică emailul dacă îți este solicitată confirmarea.");
      }
    } catch (err) {
      toast.error(
        mesajEroare(err, "Autentificarea nu a reușit. Verifică datele introduse."),
      );
    } finally {
      setSeLucreaza(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeading eyebrow="Zona clienți" title="Contul meu" />
      <div className="mx-auto mt-6 w-full max-w-md rounded-3xl border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">
          {mod === "intra" ? "Autentificare" : "Creează cont"}
        </h2>
        <form onSubmit={(e) => void trimite(e)} className="mt-4 space-y-3">
          {mod === "creeaza" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="prenume" className="text-sm font-semibold">Prenume</label>
                <input id="prenume" className="field mt-1.5" value={prenume} onChange={(e) => setPrenume(e.target.value)} />
              </div>
              <div>
                <label htmlFor="nume" className="text-sm font-semibold">Nume</label>
                <input id="nume" className="field mt-1.5" value={nume} onChange={(e) => setNume(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-semibold">Email</label>
            <input id="email" type="email" required className="field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="parola" className="text-sm font-semibold">Parolă</label>
            <input id="parola" type="password" required minLength={6} className="field mt-1.5" value={parola} onChange={(e) => setParola(e.target.value)} />
          </div>
          <button type="submit" className="btn-dark w-full" disabled={seLucreaza}>
            {mod === "intra" ? "Intră în cont" : "Creează contul"}
          </button>
        </form>
        <button
          type="button"
          className="btn-soft mt-3 w-full"
          onClick={() =>
            void lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })
          }
        >
          Continuă cu Google
        </button>
        <button
          type="button"
          className="mt-4 w-full text-sm text-muted-foreground underline"
          onClick={() => setMod(mod === "intra" ? "creeaza" : "intra")}
        >
          {mod === "intra" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
        </button>
      </div>
    </SiteLayout>
  );
}

/* ------------------------------ adrese ------------------------------- */

const ADRESA_GOALA: Omit<CustomerAddress, "id"> = {
  label: "Acasă",
  firstName: "",
  lastName: "",
  phone: "",
  county: "",
  city: "",
  street: "",
  streetNumber: "",
  building: "",
  entrance: "",
  floor: "",
  apartment: "",
  postalCode: "",
  additionalInformation: "",
  isDefault: false,
};

function FormularAdresa({
  valoare,
  onSalveaza,
  onAnuleaza,
}: {
  valoare: CustomerAddress | null;
  onSalveaza: (a: Omit<CustomerAddress, "id"> & { id?: string }) => Promise<void>;
  onAnuleaza: () => void;
}) {
  const [f, setF] = useState<Omit<CustomerAddress, "id"> & { id?: string }>(
    valoare ?? ADRESA_GOALA,
  );
  const set = (k: keyof typeof f) => (v: string | boolean) => setF((s) => ({ ...s, [k]: v }));

  const campuri: Array<[keyof typeof f, string]> = [
    ["label", "Etichetă"],
    ["lastName", "Nume"],
    ["firstName", "Prenume"],
    ["phone", "Telefon"],
    ["county", "Județ"],
    ["city", "Localitate"],
    ["street", "Stradă"],
    ["streetNumber", "Număr"],
    ["building", "Bloc"],
    ["entrance", "Scară"],
    ["floor", "Etaj"],
    ["apartment", "Apartament"],
    ["postalCode", "Cod poștal"],
  ];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSalveaza(f);
      }}
      className="rounded-3xl border border-border bg-surface p-5"
    >
      <h3 className="font-display text-lg font-semibold">
        {valoare ? "Editează adresa" : "Adaugă o adresă"}
      </h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {campuri.map(([key, label]) => (
          <div key={String(key)}>
            <label htmlFor={`a-${String(key)}`} className="text-sm font-semibold">
              {label}
            </label>
            <input
              id={`a-${String(key)}`}
              className="field mt-1.5"
              value={String(f[key] ?? "")}
              onChange={(e) => set(key)(e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="mt-3">
        <label htmlFor="a-info" className="text-sm font-semibold">Informații suplimentare</label>
        <textarea
          id="a-info"
          rows={2}
          className="field mt-1.5"
          value={f.additionalInformation}
          onChange={(e) => set("additionalInformation")(e.target.value)}
        />
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={f.isDefault}
          onChange={(e) => set("isDefault")(e.target.checked)}
        />
        Adresă implicită
      </label>
      <div className="mt-4 flex gap-2">
        <button type="submit" className="btn-dark">Salvează</button>
        <button type="button" className="btn-soft" onClick={onAnuleaza}>Renunță</button>
      </div>
    </form>
  );
}

/* ------------------------------ pagina ------------------------------- */

function ContPage() {
  const { tab = "date" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { wishlist, hydrated } = useStore();
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id ?? null;

  const [profil, setProfil] = useState<Profile | null>(null);
  const [comenzi, setComenzi] = useState<CustomerOrder[]>([]);
  const [adrese, setAdrese] = useState<CustomerAddress[]>([]);
  const [editez, setEditez] = useState<CustomerAddress | null | "nou">(null);
  const [seSalveaza, setSeSalveaza] = useState(false);

  const incarca = useCallback(async () => {
    if (!userId) return;
    try {
      const [p, o, a] = await Promise.all([
        fetchProfile(userId),
        fetchMyOrders(userId),
        fetchAddresses(userId),
      ]);
      setProfil(p);
      setComenzi(o);
      setAdrese(a);
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut încărca datele contului."));
    }
  }, [userId]);

  useEffect(() => {
    void incarca();
  }, [incarca]);

  const favorite = products.filter((p) => wishlist.includes(p.id));

  if (sessionLoading) {
    return (
      <SiteLayout>
        <PageHeading eyebrow="Zona clienți" title="Contul meu" />
        <p className="mt-6 text-sm text-muted-foreground">Se încarcă…</p>
      </SiteLayout>
    );
  }

  if (!session || !userId) return <Autentificare />;

  async function salveazaProfil(e: React.FormEvent) {
    e.preventDefault();
    if (!profil || !userId) return;
    setSeSalveaza(true);
    try {
      await saveProfile(userId, {
        firstName: profil.firstName,
        lastName: profil.lastName,
        phone: profil.phone,
        email: profil.email,
      });
      toast.success("Datele au fost salvate.");
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut salva datele."));
    } finally {
      setSeSalveaza(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeading eyebrow="Zona clienți" title="Contul meu" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto lg:flex-col" aria-label="Secțiuni cont">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => navigate({ search: { tab: t.id } })}
              aria-current={tab === t.id}
              className={`shrink-0 rounded-full px-4 py-2.5 text-left text-sm font-medium ${
                tab === t.id
                  ? "bg-foreground text-background"
                  : "border border-border bg-surface text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2.5 text-left text-sm font-medium text-destructive"
          >
            Deconectare
          </button>
        </nav>

        <div>
          {tab === "date" && (
            <form
              onSubmit={(e) => void salveazaProfil(e)}
              className="rounded-3xl border border-border bg-surface p-5"
            >
              <h2 className="font-display text-lg font-semibold">Date personale</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {([
                  ["lastName", "Nume"],
                  ["firstName", "Prenume"],
                  ["email", "Email"],
                  ["phone", "Telefon"],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <label htmlFor={`p-${key}`} className="text-sm font-semibold">{label}</label>
                    <input
                      id={`p-${key}`}
                      className="field mt-1.5"
                      value={profil?.[key] ?? ""}
                      onChange={(e) =>
                        setProfil((p) => (p ? { ...p, [key]: e.target.value } : p))
                      }
                    />
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Client din {profil ? formatDate(profil.createdAt) : "—"}
              </p>
              <button type="submit" className="btn-dark mt-4" disabled={seSalveaza}>
                Salvează datele
              </button>
            </form>
          )}

          {tab === "comenzi" &&
            (comenzi.length === 0 ? (
              <EmptyState
                title="Nu ai comenzi încă"
                description="Comenzile plasate vor apărea aici, cu tot cu statusul livrării."
                action={
                  <Link to="/bijuterii" className="btn-dark">
                    Începe cumpărăturile
                  </Link>
                }
              />
            ) : (
              <ul className="space-y-3">
                {comenzi.map((o) => (
                  <li key={o.id} className="rounded-3xl border border-border bg-surface p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-display font-semibold">Comanda {o.number}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[o.status]}`}>
                        {ORDER_STATUS_LABELS[o.status]}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                      {o.items.map((item) => (
                        <li key={item.id}>
                          {item.name}
                          {item.variantLabel ? ` — ${item.variantLabel}` : ""} × {item.quantity} ·{" "}
                          {formatPrice(item.total)}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Transport: {o.shipping === 0 ? "Gratuit" : formatPrice(o.shipping)}
                      {o.awb ? ` · AWB: ${o.awb}` : ""}
                    </p>
                    <p className="mt-1 font-display font-semibold">Total: {formatPrice(o.total)}</p>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "adrese" && (
            <div className="space-y-4">
              {editez ? (
                <FormularAdresa
                  valoare={editez === "nou" ? null : editez}
                  onAnuleaza={() => setEditez(null)}
                  onSalveaza={async (a) => {
                    try {
                      await saveAddress(userId, a);
                      toast.success("Adresa a fost salvată.");
                      setEditez(null);
                      await incarca();
                    } catch (err) {
                      toast.error(mesajEroare(err, "Nu am putut salva adresa."));
                    }
                  }}
                />
              ) : (
                <button type="button" className="btn-dark" onClick={() => setEditez("nou")}>
                  Adaugă o adresă
                </button>
              )}

              {adrese.length === 0 && !editez ? (
                <EmptyState
                  title="Nu ai adrese salvate"
                  description="Adaugă o adresă pentru a finaliza comenzile mai rapid."
                />
              ) : (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {adrese.map((a) => (
                    <li key={a.id} className="rounded-3xl border border-border bg-surface p-4 text-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-display font-semibold">{a.label}</p>
                        {a.isDefault && (
                          <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold">
                            Implicită
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-muted-foreground">
                        {a.lastName} {a.firstName} · {a.phone}
                        <br />
                        {a.street} nr. {a.streetNumber}
                        {a.building ? `, bl. ${a.building}` : ""}
                        {a.entrance ? `, sc. ${a.entrance}` : ""}
                        {a.floor ? `, et. ${a.floor}` : ""}
                        {a.apartment ? `, ap. ${a.apartment}` : ""}
                        <br />
                        {a.city}, jud. {a.county}, {a.postalCode}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <button type="button" className="btn-soft" onClick={() => setEditez(a)}>
                          Editează
                        </button>
                        <button
                          type="button"
                          className="btn-soft text-destructive"
                          onClick={async () => {
                            try {
                              await deleteAddress(a.id);
                              toast.success("Adresa a fost ștearsă.");
                              await incarca();
                            } catch (err) {
                              toast.error(mesajEroare(err, "Nu am putut șterge adresa."));
                            }
                          }}
                        >
                          Șterge
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "favorite" &&
            (!hydrated ? (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3" aria-busy="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-72 animate-pulse rounded-3xl bg-muted" />
                ))}
              </div>
            ) : favorite.length === 0 ? (
              <EmptyState
                title="Nu ai produse favorite"
                description="Apasă pe inimioara de pe un produs ca să îl salvezi aici."
                action={
                  <Link to="/bijuterii" className="btn-dark">
                    Descoperă bijuteriile
                  </Link>
                }
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {favorite.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ))}
        </div>
      </div>
    </SiteLayout>
  );
}
