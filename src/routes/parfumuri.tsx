import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogListing } from "@/components/CatalogListing";
import { validateListingSearch, type ListingSearch } from "@/lib/listing";

export const Route = createFileRoute("/parfumuri")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Parfumuri — arome pentru fiecare zi | Casa Elegantei" },
      {
        name: "description",
        content:
          "Parfumuri și ape de parfum pentru femei și bărbați: filtrează după categorie, brand, preț și disponibilitate. Livrare rapidă în toată România.",
      },
      { property: "og:title", content: "Parfumuri — catalog complet | Casa Elegantei" },
      {
        property: "og:description",
        content: "Parfumuri și ape de parfum pentru fiecare zi și pentru ocazii speciale.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ParfumuriPage,
});

function ParfumuriPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SiteLayout>
      <CatalogListing
        departmentSlug="parfumuri"
        eyebrow="Departament"
        title="Parfumuri"
        description="Filtrează după categorie, brand, preț și disponibilitate pentru a găsi parfumul potrivit."
        search={search}
        onChange={(patch: Partial<ListingSearch>) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
        onReset={() => navigate({ search: {} })}
      />
    </SiteLayout>
  );
}
