import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteLayout, EmptyState } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import { products } from "@/data/catalog";

export const Route = createFileRoute("/noutati")({
  head: () => ({
    meta: [
      { title: "Noutăți — cele mai noi bijuterii | BIJUTERII" },
      {
        name: "description",
        content: "Cele mai noi modele de inele, coliere, brățări și cercei adăugate în magazin.",
      },
      { property: "og:title", content: "Noutăți | BIJUTERII" },
      { property: "og:description", content: "Cele mai noi bijuterii adăugate în magazin." },
    ],
  }),
  component: NoutatiPage,
});

function NoutatiPage() {
  const noi = [...products]
    .filter((p) => p.status === "activ")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Proaspăt sosite"
        title="Noutăți"
        description="Cele mai recente piese adăugate în catalog."
      />
      {noi.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nu există produse noi"
            description="Revino în curând pentru cele mai noi modele."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {noi.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </SiteLayout>
  );
}
