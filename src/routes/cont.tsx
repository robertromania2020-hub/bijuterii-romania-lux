import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { EmptyState, PageHeading, SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { customers, orders, products } from "@/data/catalog";
import { ORDER_STATUS_LABELS, type Address, type OrderStatus } from "@/data/types";
import { formatDate, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

type Tab = "date" | "comenzi" | "adrese" | "favorite";

export const Route = createFileRoute("/cont")({
  validateSearch: (search: Record<string, unknown>): { tab?: Tab | undefined } => ({
    tab: (["date", "comenzi", "adrese", "favorite"] as const).includes(search['tab'] as Tab)
      ? (search['tab'] as Tab)
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
};

const adrese: Address[] = [
  {
    id: "a1",
    label: "Acasă",
    county: "Cluj",
    city: "Cluj-Napoca",
    street: "Str. Memorandumului",
    number: "12",
    block: "B3",
    entrance: "2",
    apartment: "14",
    postalCode: "400114",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Birou",
    county: "Cluj",
    city: "Cluj-Napoca",
    street: "Bd. 21 Decembrie 1989",
    number: "77",
    postalCode: "400124",
    isDefault: false,
  },
];

function ContPage() {
  const { tab = "date" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { wishlist, hydrated } = useStore();
  const client = customers[0];
  const favorite = products.filter((p) => wishlist.includes(p.id));

  return (
    <SiteLayout>
      <PageHeading eyebrow="Zona clienți" title="Contul meu" />
      <p className="mt-2 rounded-2xl bg-peach p-3 text-xs">
        Autentificarea reală va fi activată în etapa următoare. Datele afișate sunt demonstrative.
      </p>

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
            onClick={() => toast.info("Deconectarea va fi disponibilă după activarea conturilor.")}
            className="shrink-0 rounded-full border border-border bg-surface px-4 py-2.5 text-left text-sm font-medium text-destructive"
          >
            Deconectare
          </button>
        </nav>

        <div>
          {tab === "date" && (
            <div className="rounded-3xl border border-border bg-surface p-5">
              <h2 className="font-display text-lg font-semibold">Date personale</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nume complet</dt>
                  <dd className="font-semibold">{client?.name}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-semibold">{client?.email}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Telefon</dt>
                  <dd className="font-semibold">{client?.phone}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Client din</dt>
                  <dd className="font-semibold">{client ? formatDate(client.createdAt) : "—"}</dd>
                </div>
              </dl>
            </div>
          )}

          {tab === "comenzi" && (
            <ul className="space-y-3">
              {orders.map((o) => (
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
                      <li key={item.productId}>
                        {item.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 font-display font-semibold">Total: {formatPrice(o.total)}</p>
                </li>
              ))}
            </ul>
          )}

          {tab === "adrese" && (
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
                    {a.street} nr. {a.number}
                    {a.block ? `, bl. ${a.block}` : ""}
                    {a.entrance ? `, sc. ${a.entrance}` : ""}
                    {a.apartment ? `, ap. ${a.apartment}` : ""}
                    <br />
                    {a.city}, jud. {a.county}, {a.postalCode}
                  </p>
                </li>
              ))}
            </ul>
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
