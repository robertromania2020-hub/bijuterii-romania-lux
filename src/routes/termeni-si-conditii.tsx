import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { MERCHANT_SECTION } from "@/data/company";

export const Route = createFileRoute("/termeni-si-conditii")({
  head: () => ({
    meta: [
      { title: "Termeni și condiții | Casa Elegantei" },
      {
        name: "description",
        content:
          "Termenii și condițiile de utilizare a magazinului online Casa Elegantei: comenzi, prețuri, garanție.",
      },
      { property: "og:title", content: "Termeni și condiții | Casa Elegantei" },
      { property: "og:description", content: "Reguli de utilizare a magazinului online." },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal"
      title="Termeni și condiții"
      intro="Prin plasarea unei comenzi accepți termenii de mai jos."
      sections={[
        {
          title: "Comenzi și prețuri",
          body: "Toate prețurile sunt exprimate în lei (RON) și includ TVA. Ne rezervăm dreptul de a modifica prețurile și disponibilitatea produselor fără notificare prealabilă.",
        },
        {
          title: "Garanție",
          body: "Produsele beneficiază de garanție de 24 de luni pentru defecte de fabricație, conform legislației în vigoare privind protecția consumatorului.",
        },
        {
          title: "Răspundere",
          body: "Ne asumăm responsabilitatea pentru conformitatea produselor livrate. Diferențele minore de nuanță ale imaginilor pot apărea din cauza setărilor ecranului.",
        },
        MERCHANT_SECTION,
      ]}
    />
  ),
});
