import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { CatalogListing } from "@/components/CatalogListing";
import { validateListingSearch, type ListingSearch } from "@/lib/listing";

export const Route = createFileRoute("/produse")({
  validateSearch: validateListingSearch,
  head: () => ({
    meta: [
      { title: "Toate produsele — bijuterii și machiaj | Casa Elegantei" },
      {
        name: "description",
        content:
          "Caută în întregul catalog: bijuterii și produse de machiaj, filtrate după categorie, brand, preț și disponibilitate.",
      },
      { property: "og:title", content: "Toate produsele | Casa Elegantei" },
      {
        property: "og:description",
        content: "Catalogul complet de bijuterii și machiaj, într-o singură pagină.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProdusePage,
});

function ProdusePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  return (
    <SiteLayout>
      <CatalogListing
        departmentSlug={null}
        eyebrow="Catalog"
        title="Toate produsele"
        description="Caută în tot magazinul, indiferent de departament."
        search={search}
        onChange={(patch: Partial<ListingSearch>) =>
          navigate({ search: (prev) => ({ ...prev, ...patch }) })
        }
        onReset={() => navigate({ search: {} })}
      />
    </SiteLayout>
  );
}
