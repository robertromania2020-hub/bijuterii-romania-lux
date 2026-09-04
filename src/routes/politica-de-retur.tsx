import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/politica-de-retur")({
  head: () => ({
    meta: [
      { title: "Politica de retur — 14 zile | Casa Elegantei" },
      {
        name: "description",
        content:
          "Returnezi produsele în 14 zile calendaristice, fără justificare. Află pașii și condițiile de retur.",
      },
      { property: "og:title", content: "Politica de retur | Casa Elegantei" },
      { property: "og:description", content: "Retur în 14 zile, fără justificare." },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Informații"
      title="Politica de retur"
      intro="Ai la dispoziție 14 zile calendaristice pentru a returna produsele, fără să oferi un motiv."
      sections={[
        {
          title: "Condiții de retur",
          body: "Produsele trebuie returnate în ambalajul original, nepurtate și fără urme de utilizare. Din motive de igienă, cerceii pot fi returnați doar sigilați.",
        },
        {
          title: "Cum returnezi",
          body: "Ne trimiți o solicitare pe eleganteicasa10@gmail.com cu numărul comenzii, iar noi îți transmitem formularul de retur și adresa de expediere.",
        },
        {
          title: "Rambursarea sumei",
          body: "Returnăm contravaloarea produselor în maximum 14 zile de la primirea coletului, folosind aceeași metodă de plată.",
        },
      ]}
    />
  ),
});
