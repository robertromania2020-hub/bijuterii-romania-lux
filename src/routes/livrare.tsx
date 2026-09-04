import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";
import { MERCHANT_SECTION } from "@/data/company";

export const Route = createFileRoute("/livrare")({
  head: () => ({
    meta: [
      { title: "Livrare — costuri și termene | Casa Elegantei" },
      {
        name: "description",
        content:
          "Informații despre livrarea comenzilor: curier rapid, Easybox, costuri și termene de livrare în România.",
      },
      { property: "og:title", content: "Livrare | Casa Elegantei" },
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
          body: "Transportul standard costă 25 lei, indiferent de metoda de livrare aleasă. Pentru comenzile de peste 250 lei, transportul este gratuit.",
        },
        {
          title: "Urmărirea comenzii",
          body: "După expediere primești pe email numărul AWB și un link de urmărire a coletului. Poți verifica statusul și din secțiunea „Comenzile mele” din contul tău.",
        },
        MERCHANT_SECTION,
      ]}
    />
  ),
});
