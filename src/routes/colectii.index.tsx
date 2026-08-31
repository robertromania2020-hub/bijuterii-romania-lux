import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";
import { collections } from "@/data/catalog";

export const Route = createFileRoute("/colectii/")({
  head: () => ({
    meta: [
      { title: "Colecții de bijuterii | BIJUTERII" },
      {
        name: "description",
        content:
          "Colecțiile noastre: Gold Collection, Stainless Steel, Minimal, Elegance și Cadouri.",
      },
      { property: "og:title", content: "Colecții de bijuterii | BIJUTERII" },
      { property: "og:description", content: "Gold Collection, Stainless Steel, Minimal, Elegance, Cadouri." },
    ],
  }),
  component: ColectiiPage,
});

function ColectiiPage() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Selecții curatoriate"
        title="Colecții"
        description="Piese grupate pe stil, material și ocazie."
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col, i) => (
          <Link
            key={col.id}
            to="/colectii/$slug"
            params={{ slug: col.slug }}
            className={`rounded-3xl p-4 transition-transform hover:-translate-y-0.5 ${
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
            <h2 className="mt-3 font-display text-lg font-semibold">{col.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{col.description}</p>
          </Link>
        ))}
      </div>
    </SiteLayout>
  );
}
