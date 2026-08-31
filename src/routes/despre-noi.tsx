import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/despre-noi")({
  head: () => ({
    meta: [
      { title: "Despre noi — povestea BIJUTERII" },
      {
        name: "description",
        content:
          "Suntem un magazin românesc de bijuterii din oțel inoxidabil și bijuterii placate cu aur, create pentru purtare zilnică.",
      },
      { property: "og:title", content: "Despre noi | BIJUTERII" },
      { property: "og:description", content: "Povestea din spatele magazinului BIJUTERII." },
    ],
  }),
  component: DesprePage,
});

function DesprePage() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Cine suntem"
        title="Despre noi"
        description="Bijuterii accesibile, rezistente și elegante, alese cu grijă pentru femeile care le poartă zi de zi."
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        <img
          src={heroImage}
          alt="Bijuterii placate cu aur pe catifea roz"
          loading="lazy"
          width={1024}
          height={768}
          className="aspect-[4/3] w-full rounded-[2rem] object-cover"
        />
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            BIJUTERII este un magazin online românesc dedicat bijuteriilor din oțel inoxidabil și
            bijuteriilor placate cu aur de 18K. Selectăm fiecare model astfel încât să reziste
            purtării zilnice: nu se decolorează, nu provoacă alergii și își păstrează strălucirea.
          </p>
          <p>
            Lucrăm cu producători verificați și testăm fiecare colecție înainte de a o lista. Ne
            place ideea că o bijuterie bună nu trebuie păstrată doar pentru ocazii speciale.
          </p>
          <p>
            Livrăm în toată România prin curier rapid, iar returul este posibil în 14 zile
            calendaristice. Pentru orice întrebare, echipa noastră îți răspunde de luni până vineri,
            între 09:00 și 18:00.
          </p>
        </div>
      </div>
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-lilac p-5">
          <dt className="text-sm text-muted-foreground">Clienți mulțumiți</dt>
          <dd className="font-display text-3xl font-semibold">12.000+</dd>
        </div>
        <div className="rounded-3xl bg-mint p-5">
          <dt className="text-sm text-muted-foreground">Modele în catalog</dt>
          <dd className="font-display text-3xl font-semibold">850+</dd>
        </div>
        <div className="rounded-3xl bg-peach p-5">
          <dt className="text-sm text-muted-foreground">Livrare medie</dt>
          <dd className="font-display text-3xl font-semibold">1–3 zile</dd>
        </div>
      </dl>
    </SiteLayout>
  );
}
