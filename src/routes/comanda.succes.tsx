import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { getPaymentStatus } from "@/lib/stripe-checkout.functions";

export const Route = createFileRoute("/comanda/succes")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search["session_id"] === "string" ? search["session_id"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Confirmare plată | BIJUTERII" },
      { name: "description", content: "Confirmarea plății comenzii tale în magazinul BIJUTERII." },
      { property: "og:title", content: "Confirmare plată | BIJUTERII" },
      { property: "og:description", content: "Statusul plății comenzii tale." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccesPage,
});

interface Stare {
  number: string;
  total: number;
  paymentStatus: string;
  status: string;
}

function SuccesPage() {
  const { session_id: sessionId } = Route.useSearch();
  const { clearCart } = useStore();
  const verifica = useServerFn(getPaymentStatus);
  const [stare, setStare] = useState<Stare | null>(null);
  const [seIncarca, setSeIncarca] = useState(true);
  const [eroare, setEroare] = useState<string | null>(null);

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sessionId) {
      setSeIncarca(false);
      setEroare("Sesiune de plată invalidă.");
      return;
    }
    let activ = true;
    let incercari = 0;

    async function pas() {
      try {
        const rezultat = (await verifica({ data: { sessionId } })) as Stare | null;
        if (!activ) return;
        if (rezultat) {
          setStare(rezultat);
          if (rezultat.paymentStatus === "paid" || incercari >= 8) setSeIncarca(false);
        }
        incercari += 1;
        if (activ && (!rezultat || (rezultat.paymentStatus !== "paid" && incercari < 9))) {
          setTimeout(() => void pas(), 2000);
        } else if (activ) {
          setSeIncarca(false);
        }
      } catch {
        if (!activ) return;
        setEroare("Nu am putut confirma plata. Te rugăm să contactezi magazinul.");
        setSeIncarca(false);
      }
    }

    void pas();
    return () => {
      activ = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const platita = stare?.paymentStatus === "paid";

  return (
    <SiteLayout>
      <PageHeading
        title={platita ? "Plata a fost confirmată" : "Confirmarea plății"}
        description={
          platita
            ? "Îți mulțumim! Comanda ta a fost înregistrată și plătită."
            : "Verificăm plata comenzii tale."
        }
      />

      <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
        {eroare && <p className="text-sm text-destructive">{eroare}</p>}

        {!eroare && seIncarca && (
          <p className="text-sm text-muted-foreground">Se verifică plata, te rugăm să aștepți…</p>
        )}

        {!eroare && stare && (
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Număr comandă</dt>
              <dd className="font-semibold">{stare.number}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-semibold">{formatPrice(stare.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status plată</dt>
              <dd className="font-semibold">
                {platita
                  ? "Plătită"
                  : stare.paymentStatus === "failed"
                    ? "Plată eșuată"
                    : stare.paymentStatus === "cancelled"
                      ? "Anulată"
                      : "În așteptarea plății"}
              </dd>
            </div>
          </dl>
        )}

        {!eroare && !seIncarca && !platita && (
          <p className="mt-4 rounded-2xl bg-peach p-3 text-xs">
            Dacă suma a fost debitată, plata va fi confirmată automat în câteva minute.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/cont" search={{ tab: "comenzi" }} className="btn-dark">
            Vezi comenzile mele
          </Link>
          <Link to="/produse" className="btn-soft">
            Continuă cumpărăturile
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
