import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EmptyState, PageHeading, SiteLayout } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { collections, products } from "@/data/catalog";
import { ensureCatalog } from "@/lib/catalog-live";

export const Route = createFileRoute("/colectii/$slug")({
  loader: async ({ params }) => {
    await ensureCatalog();
    const collection = collections.find((c) => c.slug === params.slug);
    if (!collection) throw notFound();
    return { collection };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Colecție indisponibilă | BIJUTERII" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { collection } = loaderData;
    return {
      meta: [
        { title: `Colecția ${collection.name} | BIJUTERII` },
        { name: "description", content: collection.description },
        { property: "og:title", content: `Colecția ${collection.name} | BIJUTERII` },
        { property: "og:description", content: collection.description },
      ],
    };
  },
  notFoundComponent: ColectieNegasita,
  errorComponent: ColectieNegasita,
  component: ColectiePage,
});

function ColectieNegasita() {
  return (
    <SiteLayout>
      <div className="pt-10">
        <EmptyState
          title="Colecția nu a fost găsită"
          description="Este posibil ca această colecție să nu mai fie disponibilă."
          action={
            <Link to="/colectii" className="btn-dark">
              Vezi toate colecțiile
            </Link>
          }
        />
      </div>
    </SiteLayout>
  );
}

function ColectiePage() {
  const { collection } = Route.useLoaderData();
  const items = products.filter((p) => p.collectionSlug === collection.slug);

  return (
    <SiteLayout>
      <PageHeading eyebrow="Colecție" title={collection.name} description={collection.description} />
      {items.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Colecția este în pregătire"
            description="Produsele din această colecție vor fi disponibile în curând."
            action={
              <Link to="/bijuterii" className="btn-dark">
                Vezi catalogul
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </SiteLayout>
  );
}
