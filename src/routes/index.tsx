import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import {
  activeProducts,
  categoriesOf,
  collections,
  departments,
} from "@/data/catalog";
import heroImage from "@/assets/hero-beauty.jpg";
import { departmentPath } from "@/lib/department-link";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Casa Elegantei — bijuterii și machiaj, eleganță în fiecare zi" },
      {
        name: "description",
        content:
          "Magazin online de bijuterii și machiaj: inele, brățări, coliere, cercei, fond de ten, farduri, rujuri și mascara. Livrare rapidă în toată România.",
      },
      { property: "og:title", content: "Casa Elegantei — bijuterii și machiaj" },
      {
        property: "og:description",
        content:
          "Bijuterii din oțel și placate cu aur, alături de produse de machiaj de la branduri cunoscute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const all = activeProducts();
  const featured = all.filter((p) => p.isFeatured).slice(0, 4);
  const bestsellers = all.filter((p) => p.isBestseller).slice(0, 4);
  const newest = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="pt-6 lg:grid lg:grid-cols-2 lg:items-center lg:gap-10 lg:pt-12">
        <div>
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Bijuterii & Machiaj — 2026
          </p>
          <h1 className="animate-rise mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-balance lg:text-6xl">
            Frumusețe pe care o <span className="text-primary">porți</span> în fiecare zi
          </h1>
          <p className="animate-rise mt-3 max-w-[42ch] text-sm text-muted-foreground text-pretty lg:text-base">
            Două departamente, o singură comandă: bijuterii din oțel și placate cu aur, plus
            produse de machiaj de la branduri cunoscute.
          </p>
          <div className="animate-rise mt-5 flex flex-wrap gap-3">
            <Link to="/bijuterii" className="btn-dark">
              Descoperă bijuteriile
            </Link>
            <Link to="/machiaj" className="btn-primary">
              Descoperă machiajul
            </Link>
          </div>
        </div>
        <img
          src={heroImage}
          alt="Bijuterii placate cu aur și produse de machiaj așezate pe un fundal pastelat"
          width={1024}
          height={768}
          className="animate-rise mt-6 aspect-[4/3] w-full rounded-[2rem] object-cover lg:mt-0"
        />
      </section>

      {/* Departamente */}
      <section className="mt-12" aria-labelledby="titlu-departamente">
        <h2
          id="titlu-departamente"
          className="mb-4 font-display text-2xl font-semibold tracking-tight"
        >
          Departamente
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {departments.map((d) => (
            <Link
              key={d.id}
              to={departmentPath(d.slug)}
              className={`overflow-hidden rounded-[2rem] p-4 transition-transform hover:-translate-y-0.5 ${toneClass[d.tone]}`}
            >
              <img
                src={d.image}
                alt={d.name}
                loading="lazy"
                width={800}
                height={600}
                className="aspect-[4/3] w-full rounded-3xl object-cover"
              />
              <h3 className="mt-3 font-display text-xl font-semibold">{d.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categorii pe departament */}
      {departments.map((d) => (
        <section key={d.id} className="mt-12" aria-labelledby={`titlu-cat-${d.slug}`}>
          <div className="mb-4 flex items-end justify-between">
            <h2
              id={`titlu-cat-${d.slug}`}
              className="font-display text-2xl font-semibold tracking-tight"
            >
              Categorii {d.name.toLowerCase()}
            </h2>
            <Link
              to={departmentPath(d.slug)}
              className="text-sm font-semibold text-primary"
            >
              Vezi toate
            </Link>
          </div>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0">
            {categoriesOf(d.slug)
              .slice(0, 6)
              .map((cat) => (
                <Link
                  key={cat.id}
                  to={departmentPath(d.slug)}
                  search={{ categorie: cat.slug }}
                  className={`w-36 shrink-0 rounded-3xl p-3 transition-transform hover:-translate-y-0.5 lg:w-auto ${toneClass[cat.tone]}`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    width={640}
                    height={640}
                    className="aspect-square w-full rounded-2xl object-cover"
                  />
                  <p className="mt-2.5 font-display text-sm font-semibold">{cat.name}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}

      {/* Produse recomandate */}
      <section className="mt-12" aria-labelledby="titlu-populare">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="titlu-populare" className="font-display text-2xl font-semibold tracking-tight">
            Produse recomandate
          </h2>
          <Link to="/produse" search={{ sortare: "populare" }} className="text-sm font-semibold text-primary">
            Toate
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Bestselleruri */}
      <section className="mt-12" aria-labelledby="titlu-bestsellers">
        <div className="mb-4 flex items-end justify-between">
          <h2 id="titlu-bestsellers" className="font-display text-2xl font-semibold tracking-tight">
            Cele mai vândute
          </h2>
          <Link to="/produse" search={{ sortare: "populare" }} className="text-sm font-semibold text-primary">
            Toate
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {bestsellers.map((p) => (
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
            Reduceri la bijuterii placate cu aur și la produsele de machiaj preferate.
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
