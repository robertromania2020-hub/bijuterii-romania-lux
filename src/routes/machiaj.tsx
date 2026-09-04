import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogListing } from "@/components/CatalogListing";
import { validateListingSearch, type ListingSearch } from "@/lib/listing";

export const Route = createFileRoute("/machiaj")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Machiaj — fond de ten, farduri, rujuri, mascara | Casa Elegantei" },
      {
        name: "description",
        content:
          "Produse de machiaj de la branduri cunoscute: fond de ten, palete de farduri, rujuri, mascara și fixatoare. Filtrează după brand, nuanță și finish.",
      },
      { property: "og:title", content: "Machiaj — catalog complet | Casa Elegantei" },
      {
        property: "og:description",
        content: "Fond de ten, farduri, rujuri și mascara de la branduri cunoscute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MachiajPage,
});

function MachiajPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SiteLayout>
      <CatalogListing
        departmentSlug="machiaj"
        eyebrow="Departament"
        title="Machiaj"
        description="Filtrează după categorie, brand, nuanță, finish și preț pentru a găsi produsul potrivit."
        search={search}
        onChange={(patch: Partial<ListingSearch>) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
        onReset={() => navigate({ search: {} })}
      />
    </SiteLayout>
  );
}
