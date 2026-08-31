import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/livrare")({
  head: () => ({
    meta: [
      { title: "Livrare — costuri și termene | BIJUTERII" },
      {
        name: "description",
        content:
          "Informații despre livrarea comenzilor: curier rapid, Easybox, costuri și termene de livrare în România.",
      },
      { property: "og:title", content: "Livrare | BIJUTERII" },
      { property: "og:description", content: "Costuri și termene de livrare în România." },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Informații"
      title="Livrare"
      intro="Livrăm în toată România prin curier rapid și în rețeaua de Easybox."
      sections={[
        {
          title: "Termene de livrare",
          body: "Comenzile plasate până la ora 14:00 în zilele lucrătoare sunt procesate în aceeași zi. Livrarea durează între 1 și 3 zile lucrătoare, în funcție de localitate.",
        },
        {
          title: "Costuri de transport",
          body: "Transportul prin curier costă 19,99 lei, iar livrarea în Easybox costă 14,99 lei. Pentru comenzile de peste 250 lei, transportul prin curier este gratuit.",
        },
        {
          title: "Urmărirea comenzii",
          body: "După expediere primești pe email numărul AWB și un link de urmărire a coletului. Poți verifica statusul și din secțiunea „Comenzile mele” din contul tău.",
        },
      ]}
    />
  ),
});
