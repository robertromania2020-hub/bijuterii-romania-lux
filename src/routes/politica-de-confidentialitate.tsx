import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/politica-de-confidentialitate")({
  head: () => ({
    meta: [
      { title: "Politica de confidențialitate | Casa Elegantei" },
      {
        name: "description",
        content:
          "Cum colectăm, folosim și protejăm datele tale personale, conform Regulamentului GDPR.",
      },
      { property: "og:title", content: "Politica de confidențialitate | Casa Elegantei" },
      { property: "og:description", content: "Protecția datelor personale conform GDPR." },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Legal"
      title="Politica de confidențialitate"
      intro="Prelucrăm datele tale personale conform Regulamentului (UE) 2016/679 (GDPR)."
      sections={[
        {
          title: "Datele colectate",
          body: "Colectăm numele, adresa de livrare, numărul de telefon și adresa de email, necesare pentru procesarea și livrarea comenzilor.",
        },
        {
          title: "Scopul prelucrării",
          body: "Folosim datele pentru procesarea comenzilor, comunicarea privind statusul livrării și, cu acordul tău, pentru trimiterea newsletterului.",
        },
        {
          title: "Drepturile tale",
          body: "Ai dreptul de acces, rectificare, ștergere, restricționare și portabilitate a datelor. Ne poți scrie oricând la eleganteicasa10@gmail.com.",
        },
      ]}
    />
  ),
});
