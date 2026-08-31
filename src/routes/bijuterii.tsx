import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogListing } from "@/components/CatalogListing";
import { validateListingSearch, type ListingSearch } from "@/lib/listing";

export const Route = createFileRoute("/bijuterii")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Bijuterii — inele, brățări, coliere, cercei | BIJUTERII" },
      {
        name: "description",
        content:
          "Toate bijuteriile noastre: filtrează după categorie, material, culoare, preț și disponibilitate. Livrare rapidă în toată România.",
      },
      { property: "og:title", content: "Bijuterii — catalog complet | BIJUTERII" },
      {
        property: "og:description",
        content: "Inele, brățări, coliere și cercei din oțel inoxidabil și placate cu aur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BijuteriiPage,
});

function BijuteriiPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SiteLayout>
      <CatalogListing
        departmentSlug="bijuterii"
        eyebrow="Departament"
        title="Bijuterii"
        description="Filtrează după categorie, material, culoare, preț și disponibilitate pentru a găsi piesa potrivită."
        search={search}
        onChange={(patch: Partial<ListingSearch>) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
        onReset={() => navigate({ search: {} })}
      />
    </SiteLayout>
  );
}
