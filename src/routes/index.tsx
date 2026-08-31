import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { categories, collections, products } from "@/data/catalog";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BIJUTERII — Eleganță pe care o porți în fiecare zi" },
      {
        name: "description",
        content:
          "Descoperă colecția de bijuterii din oțel inoxidabil și bijuterii placate cu aur: inele, brățări, coliere, cercei și seturi cadou.",
      },
      { property: "og:title", content: "BIJUTERII — Eleganță pe care o porți în fiecare zi" },
      {
        property: "og:description",
        content: "Bijuterii din oțel și placate cu aur, create pentru a-ți completa stilul.",
      },
    ],
  }),
  component: HomePage,
});

const toneClass = {
  lilac: "bg-lilac",
  mint: "bg-mint",
  peach: "bg-peach",
} as const;

function HomePage() {
  const featured = products.filter((p) => p.isFeatured).slice(0, 4);
  const newest = [...products]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-12">
        <div>
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Colecția 2026
          </p>
          <h1 className="animate-rise mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance lg:text-6xl">
            Eleganță pe care o <span className="text-primary">porți</span> în fiecare zi
          </h1>
          <p className="animate-rise mt-3 max-w-[42ch] text-sm text-muted-foreground text-pretty lg:text-base">
            Descoperă colecția noastră de bijuterii din oțel și bijuterii placate cu aur, create
            pentru a-ți completa stilul.
          </p>
          <div className="animate-rise mt-5 flex gap-3">
            <Link to="/bijuterii" className="btn-dark flex-1 text-center lg:flex-none">
              Descoperă colecția
            </Link>
            <Link to="/reduceri" className="btn-primary">
              Vezi reducerile
            </Link>
          </div>
        </div>
        <img
          src={heroImage}
          alt="Inele și colier placate cu aur pe catifea roz"
          width={1024}
          height={768}
          className="animate-rise mt-6 aspect-[4/3] w-full rounded-[2rem] object-cover lg:mt-0"
        />
      </section>

      {/* Categorii */}
      <section className="mt-12" aria-labelledby="titlu-categorii">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="titlu-categorii" className="font-display text-2xl font-semibold tracking-tight">
            Categorii
          </h2>
          <Link to="/bijuterii" className="text-sm font-semibold text-primary">
            Vezi toate
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/bijuterii"
              search={{ categorie: cat.slug }}
              className={`rounded-3xl p-4 transition-transform hover:-translate-y-0.5 ${toneClass[cat.tone]}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                loading="lazy"
                width={640}
                height={640}
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <p className="mt-3 font-display font-semibold">{cat.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {cat.productCount} produse
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Produse populare */}
      <section className="mt-12" aria-labelledby="titlu-populare">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="titlu-populare" className="font-display text-2xl font-semibold tracking-tight">
            Produse populare
          </h2>
          <Link to="/bijuterii" search={{ sortare: "populare" }} className="text-sm font-semibold text-primary">
            Toate
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Noutăți */}
      <section className="mt-12" aria-labelledby="titlu-noutati">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="titlu-noutati" className="font-display text-2xl font-semibold tracking-tight">
            Noutăți
          </h2>
          <Link to="/noutati" className="text-sm font-semibold text-primary">
            Toate
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {newest.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Reduceri */}
      <section className="mt-12" aria-labelledby="titlu-reduceri">
        <div className="relative overflow-hidden rounded-[2rem] bg-foreground p-6 text-background lg:p-10">
          <span className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/30" />
          <span className="absolute bottom-2 left-1/2 size-14 rounded-full bg-gold/30" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-background/60">
            Ofertă limitată
          </p>
          <h2
            id="titlu-reduceri"
            className="mt-2 font-display text-4xl font-semibold leading-none tracking-tight lg:text-5xl"
          >
            Până la <span className="text-gold">-30%</span>
          </h2>
          <p className="mt-2 max-w-[34ch] text-sm text-background/70">
            Reduceri speciale pe bijuterii placate cu aur și din oțel inoxidabil.
          </p>
          <Link
            to="/reduceri"
            className="mt-4 inline-block rounded-full bg-background px-5 py-3 text-sm font-semibold text-foreground transition-transform active:scale-[0.97]"
          >
            Vezi toate reducerile
          </Link>
        </div>
      </section>

      {/* Colecții */}
      <section className="mt-12" aria-labelledby="titlu-colectii">
        <h2 id="titlu-colectii" className="mb-4 font-display text-2xl font-semibold tracking-tight">
          Colecții
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {collections.map((col, i) => (
            <Link
              key={col.id}
              to="/colectii/$slug"
              params={{ slug: col.slug }}
              className={`w-40 shrink-0 rounded-3xl p-3 ${
                ["bg-lilac", "bg-mint", "bg-peach"][i % 3]
              }`}
            >
              <img
                src={col.image}
                alt={col.name}
                loading="lazy"
                width={640}
                height={640}
                className="aspect-square w-full rounded-2xl object-cover"
              />
              <p className="mt-2.5 font-display text-sm font-semibold">{col.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
