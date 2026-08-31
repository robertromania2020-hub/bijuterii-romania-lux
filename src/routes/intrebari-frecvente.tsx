import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/intrebari-frecvente")({
  head: () => ({
    meta: [
      { title: "Întrebări frecvente | BIJUTERII" },
      {
        name: "description",
        content:
          "Răspunsuri la cele mai frecvente întrebări despre materiale, îngrijirea bijuteriilor, livrare și retur.",
      },
      { property: "og:title", content: "Întrebări frecvente | BIJUTERII" },
      { property: "og:description", content: "Materiale, îngrijire, livrare și retur." },
    ],
  }),
  component: () => (
    <InfoPage
      eyebrow="Ajutor"
      title="Întrebări frecvente"
      intro="Cele mai frecvente întrebări primite de la clienți."
      sections={[
        {
          title: "Bijuteriile se decolorează?",
          body: "Piesele din oțel inoxidabil și cele placate cu aur de 18K sunt rezistente la apă și la transpirație. Cu îngrijire normală își păstrează aspectul mulți ani.",
        },
        {
          title: "Cum îngrijesc bijuteriile?",
          body: "Evită contactul cu parfumul și produsele cosmetice, șterge piesele cu o lavetă moale după purtare și păstrează-le în punguța primită.",
        },
        {
          title: "Pot schimba mărimea unui inel?",
          body: "Da, în termen de 14 zile poți solicita schimbul cu altă mărime, dacă produsul este nepurtat și în ambalajul original.",
        },
        {
          title: "Trimiteți și în afara României?",
          body: "Momentan livrăm doar pe teritoriul României. Livrările internaționale sunt în pregătire.",
        },
      ]}
    />
  ),
});
