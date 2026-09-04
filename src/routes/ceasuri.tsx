import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogListing } from "@/components/CatalogListing";
import { validateListingSearch, type ListingSearch } from "@/lib/listing";

export const Route = createFileRoute("/ceasuri")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Ceasuri — eleganță la încheietură | Casa Elegantei" },
      {
        name: "description",
        content:
          "Ceasuri elegante pentru femei și bărbați: filtrează după categorie, brand, preț și disponibilitate. Livrare rapidă în toată România.",
      },
      { property: "og:title", content: "Ceasuri — catalog complet | Casa Elegantei" },
      {
        property: "og:description",
        content: "Ceasuri cu brățară metalică sau curea din piele, alese pentru purtare zilnică.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CeasuriPage,
});

function CeasuriPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SiteLayout>
      <CatalogListing
        departmentSlug="ceasuri"
        eyebrow="Departament"
        title="Ceasuri"
        description="Filtrează după categorie, brand, preț și disponibilitate pentru a găsi ceasul potrivit."
        search={search}
        onChange={(patch: Partial<ListingSearch>) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
        onReset={() => navigate({ search: {} })}
      />
    </SiteLayout>
  );
}
