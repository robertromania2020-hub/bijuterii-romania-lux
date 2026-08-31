import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeading, SiteLayout, EmptyState } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/catalog";

export const Route = createFileRoute("/reduceri")({
  head: () => ({
    meta: [
      { title: "Reduceri — până la -30% la bijuterii și machiaj | BIJUTERII" },
      {
        name: "description",
        content:
          "Descoperă reducerile la bijuterii și la produsele de machiaj. Oferte limitate, până la -30%.",
      },
      { property: "og:title", content: "Descoperă reducerile | BIJUTERII" },
      { property: "og:description", content: "Oferte limitate la bijuterii și machiaj, până la -30%." },
    ],
  }),
  component: ReduceriPage,
});

function ReduceriPage() {
  const laReducere = products.filter((p) => p.oldPrice !== null && p.status === "activ");

  return (
    <SiteLayout>
      <section className="mt-6 overflow-hidden rounded-[2rem] bg-foreground p-6 text-background lg:p-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/60">
          Ofertă limitată
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight lg:text-5xl">
          Descoperă reducerile — până la <span className="text-gold">-30%</span>
        </h1>
        <p className="mt-2 max-w-[40ch] text-sm text-background/70">
          Reduceri active pe categorii și colecții selectate. Prețurile afișate includ deja
          reducerea.
        </p>
        <Link
          to="/produse"
          search={{ reduceri: true }}
          className="mt-4 inline-block rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground"
        >
          Vezi toate reducerile
        </Link>
      </section>

      <PageHeading title="Produse la reducere" />

      {laReducere.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nicio reducere activă"
            description="Momentan nu există campanii de reduceri. Abonează-te la newsletter ca să afli primul."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {laReducere.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </SiteLayout>
  );
}
