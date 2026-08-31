import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { EmptyState, PageHeading, SiteLayout } from "@/components/SiteLayout";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, useStore } from "@/lib/store";

export const Route = createFileRoute("/cos")({
  head: () => ({
    meta: [
      { title: "Coșul meu | BIJUTERII" },
      {
        name: "description",
        content: "Verifică produsele din coș, actualizează cantitățile și finalizează comanda.",
      },
      { property: "og:title", content: "Coșul meu | BIJUTERII" },
      { property: "og:description", content: "Produsele selectate pentru comandă." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CosPage,
});

function CosPage() {
  const { cartLines, totals, updateQuantity, removeFromCart, hydrated } = useStore();

  return (
    <SiteLayout>
      <PageHeading title="Coșul meu" description="Verifică produsele înainte de a plasa comanda." />

      {!hydrated ? (
        <div className="mt-6 space-y-3" aria-busy="true">
          {[0, 1].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : cartLines.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Coșul tău este gol"
            description="Adaugă bijuteriile care îți plac și revino aici pentru a finaliza comanda."
            action={
              <Link to="/bijuterii" className="btn-dark">
                Continuă cumpărăturile
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <ul className="space-y-3">
            {cartLines.map((line) => (
              <li
                key={`${line.productId}-${line.variant ?? ""}`}
                className="flex gap-4 rounded-3xl border border-border bg-surface p-3"
              >
                <Link to="/produs/$slug" params={{ slug: line.product.slug }} className="shrink-0">
                  <img
                    src={line.product.images[0]}
                    alt={line.product.name}
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-24 rounded-2xl object-cover"
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold">
                        <Link to="/produs/$slug" params={{ slug: line.product.slug }}>
                          {line.product.name}
                        </Link>
                      </h2>
                      {line.variant && (
                        <p className="text-xs text-muted-foreground">Mărime: {line.variant}</p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatPrice(line.product.price)} / buc.
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Elimină ${line.product.name} din coș`}
                      className="grid size-9 place-items-center rounded-full hover:bg-muted"
                      onClick={() => removeFromCart(line.productId, line.variant)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-full border border-border p-1">
                      <button
                        type="button"
                        aria-label="Scade cantitatea"
                        className="grid size-8 place-items-center rounded-full hover:bg-muted"
                        onClick={() =>
                          updateQuantity(line.productId, line.variant, line.quantity - 1)
                        }
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label="Crește cantitatea"
                        className="grid size-8 place-items-center rounded-full hover:bg-muted"
                        onClick={() =>
                          updateQuantity(line.productId, line.variant, line.quantity + 1)
                        }
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <span className="font-display font-semibold">
                      {formatPrice(line.product.price * line.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-3xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold">Sumar comandă</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reducere</dt>
                <dd className="text-primary">-{formatPrice(totals.discount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Transport</dt>
                <dd>{totals.shipping === 0 ? "Gratuit" : formatPrice(totals.shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd className="font-display">{formatPrice(totals.total)}</dd>
              </div>
            </dl>
            {totals.shipping > 0 && (
              <p className="mt-3 rounded-2xl bg-mint p-3 text-xs">
                Mai adaugă {formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal)} pentru transport
                gratuit.
              </p>
            )}
            <Link to="/checkout" className="btn-dark mt-5 block text-center">
              Finalizează comanda
            </Link>
            <Link to="/bijuterii" className="btn-soft mt-2 block text-center">
              Continuă cumpărăturile
            </Link>
          </aside>
        </div>
      )}
    </SiteLayout>
  );
}
