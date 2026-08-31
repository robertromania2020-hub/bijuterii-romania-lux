import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { discountPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { getBrand } from "@/data/catalog";
import { STOCK_LABELS, stockStatus, type Product } from "@/data/types";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const status = stockStatus(product);
  const percent = discountPercent(product.price, product.oldPrice);
  const favorite = isInWishlist(product.id);
  const outOfStock = status === "stoc_epuizat";

  return (
    <article className="relative rounded-3xl border border-border bg-surface p-2.5">
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
        {percent !== null && (
          <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
            -{percent}%
          </span>
        )}
        {product.isNew && (
          <span className="rounded-full bg-lilac px-2.5 py-1 text-[11px] font-bold text-foreground">
            Nou
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(favorite ? "Eliminat de la favorite" : "Adăugat la favorite");
        }}
        aria-pressed={favorite}
        aria-label={favorite ? "Elimină de la favorite" : "Adaugă la favorite"}
        className="absolute right-4 top-4 z-10 grid size-8 place-items-center rounded-full bg-surface/85"
      >
        <Heart className={`size-4 ${favorite ? "fill-primary text-primary" : ""}`} />
      </button>

      <Link
        to="/produs/$slug"
        params={{ slug: product.slug }}
        className="block overflow-hidden rounded-2xl bg-muted"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          width={640}
          height={640}
          className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
        />
      </Link>

      <div className="px-1 pb-1">
        {getBrand(product.brandSlug) && (
          <p className="mt-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {getBrand(product.brandSlug)!.name}
          </p>
        )}
        <h3 className="mt-1 text-sm font-semibold leading-tight">
          <Link to="/produs/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <p
          className={`mt-0.5 font-mono text-[10px] ${
            outOfStock ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {STOCK_LABELS[status]}
        </p>
        <div className="mt-1 flex items-baseline gap-1.5">
          <span
            className={`font-display font-semibold ${percent !== null ? "text-primary" : ""}`}
          >
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <button
          type="button"
          disabled={outOfStock}
          onClick={() => {
            addToCart(product.id, 1, product.variants[0]?.label ?? null);
            toast.success("Produs adăugat în coș");
          }}
          className="btn-soft mt-2.5 w-full"
        >
          {outOfStock ? "Stoc epuizat" : "Adaugă în coș"}
        </button>
      </div>
    </article>
  );
}
