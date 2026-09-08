import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeading } from "@/components/SiteLayout";
import ghidMarimi from "@/assets/ghid-marimi-inele.jpg.asset.json";

export const Route = createFileRoute("/ghid-marimi-inele")({
  head: () => ({
    meta: [
      { title: "Ghid mărimi inele — tabel universal | Casa Elegantei" },
      {
        name: "description",
        content:
          "Tabel universal de mărimi pentru inele: echivalență EU (ISO), US, UK și Asia, diametru interior și circumferință, plus sfaturi pentru măsurarea corectă.",
      },
      { property: "og:title", content: "Ghid mărimi inele — Casa Elegantei" },
      {
        property: "og:description",
        content: "Află-ți mărimea potrivită la inele cu tabelul nostru universal de echivalențe.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GhidMarimiInele,
});

function GhidMarimiInele() {
  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Ghid de cumpărături"
        title="Tabel universal — mărimi inele"
        description="Echivalență în sistemele internaționale (ISO 8653 / GIA): mărimi EU, US, UK și Asia, diametru interior și circumferință. Mai jos găsești și pașii pentru măsurarea corectă acasă."
      />
      <div className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-surface p-3 sm:p-5">
        <img
          src={ghidMarimi.url}
          alt="Tabel universal de mărimi pentru inele: echivalență EU, US, UK și Asia, cu diametru interior și circumferință, plus instrucțiuni de măsurare"
          width={1024}
          height={1536}
          className="mx-auto w-full max-w-3xl rounded-3xl"
        />
      </div>
      <p className="mt-4 max-w-[60ch] text-sm text-muted-foreground">
        Sfat: dacă ești între două mărimi, alege-o pe cea mai mare. Pentru precizie maximă,
        recomandăm măsurarea la un bijutier. Ai nevoie de ajutor? Sună-ne sau scrie-ne pe
        WhatsApp și te ghidăm noi.
      </p>
    </SiteLayout>
  );
}
