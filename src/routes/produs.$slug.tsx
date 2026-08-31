import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, RotateCcw, Shield, Truck } from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, EmptyState } from "@/components/SiteLayout";
import { ProductCard } from "@/components/ProductCard";
import {
  activeProducts,
  attributesFor,
  formatAttributeValue,
  getBrand,
  getCategory,
  getDepartment,
  getProductBySlug,
} from "@/data/catalog";
import { STOCK_LABELS, stockStatus } from "@/data/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/produs/$slug")({
  loader: ({ params }) => {
    const product = getProductBySlug(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Produs indisponibil | BIJUTERII" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} | BIJUTERII` },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: `${product.name} | BIJUTERII` },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  notFoundComponent: ProdusNegasit,
  errorComponent: ProdusEroare,
  component: ProductPage,
});

function ProdusNegasit() {
  return (
    <SiteLayout>
      <div className="pt-10">
        <EmptyState
          title="Produsul nu a fost găsit"
          description="Este posibil ca produsul să fi fost eliminat din catalog."
          action={
            <Link to="/bijuterii" className="btn-dark">
              Vezi toate bijuteriile
            </Link>
          }
        />
      </div>
    </SiteLayout>
  );
}

function ProdusEroare() {
  return (
    <SiteLayout>
      <div className="pt-10">
        <EmptyState
          title="Produsul nu s-a putut încărca"
          description="A apărut o eroare. Te rugăm să reîncerci."
          action={
            <Link to="/bijuterii" className="btn-dark">
              Înapoi la catalog
            </Link>
          }
        />
      </div>
    </SiteLayout>
  );
}

function ProductPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [imageIndex, setImageIndex] = useState(0);
  const activeVariants = product.variants.filter((v) => v.active);
  const [variantId, setVariantId] = useState<string | null>(activeVariants[0]?.id ?? null);
  const [quantity, setQuantity] = useState(1);

  const selected = activeVariants.find((v) => v.id === variantId) ?? null;
  const price = selected?.price ?? product.price;
  const stoc = selected ? selected.stock : product.stock;
  const status = stockStatus({ stock: stoc, minStock: product.minStock });
  const outOfStock = status === "stoc_epuizat";
  const percent = discountPercent(price, product.oldPrice);
  const favorite = isInWishlist(product.id);
  const brand = getBrand(product.brandSlug);
  const department = getDepartment(product.departmentSlug);
  const category = getCategory(product.categorySlug);
  const specs = attributesFor(product.departmentSlug, product.categorySlug).filter(
    (def) => def.showOnProduct && product.attributes[def.key] !== undefined,
  );
  const similare = activeProducts()
    .filter((p) => p.id !== product.id && p.categorySlug === product.categorySlug)
    .slice(0, 4);

  return (
    <SiteLayout>
      <nav aria-label="Navigare secundară" className="pt-6 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Acasă
        </Link>
        <span aria-hidden="true"> / </span>
        {product.departmentSlug === "machiaj" ? (
          <Link to="/machiaj" className="hover:underline">
            Machiaj
          </Link>
        ) : (
          <Link to="/bijuterii" className="hover:underline">
            Bijuterii
          </Link>
        )}
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 lg:grid-cols-2">
        <div>
          <img
            src={product.images[imageIndex]}
            alt={product.name}
            width={640}
            height={640}
            className="aspect-square w-full rounded-[2rem] object-cover"
          />
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Imaginea ${i + 1}`}
                  aria-current={i === imageIndex}
                  className={`size-20 overflow-hidden rounded-2xl border-2 ${
                    i === imageIndex ? "border-primary" : "border-transparent"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    loading="lazy"
                    width={160}
                    height={160}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {product.isNew && (
              <span className="rounded-full bg-lilac px-3 py-1 text-xs font-bold">Nou</span>
            )}
            {percent !== null && (
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                Reducere -{percent}%
              </span>
            )}
          </div>

          {brand && (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {brand.name}
            </p>
          )}
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-balance">
            {product.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            SKU: {selected?.sku ?? product.sku}
          </p>

          <div className="mt-4 flex items-baseline gap-3">
            <span
              className={`font-display text-3xl font-semibold ${percent !== null ? "text-primary" : ""}`}
            >
              {formatPrice(price)}
            </span>
            {product.oldPrice && (
              <span className="text-base text-muted-foreground line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          <p
            className={`mt-3 text-sm font-semibold ${
              status === "in_stoc"
                ? "text-success"
                : status === "stoc_limitat"
                  ? "text-warning"
                  : "text-destructive"
            }`}
          >
            {STOCK_LABELS[status]}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-muted p-3">
              <dt className="text-xs text-muted-foreground">Departament</dt>
              <dd className="font-semibold">{department?.name ?? "—"}</dd>
            </div>
            <div className="rounded-2xl bg-muted p-3">
              <dt className="text-xs text-muted-foreground">Categorie</dt>
              <dd className="font-semibold">{category?.name ?? "—"}</dd>
            </div>
            {specs.map((def) => (
              <div key={def.id} className="rounded-2xl bg-muted p-3">
                <dt className="text-xs text-muted-foreground">{def.label}</dt>
                <dd className="font-semibold">
                  {formatAttributeValue(def, product.attributes[def.key]!)}
                </dd>
              </div>
            ))}
          </dl>

          {activeVariants.length > 0 && (
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold">
                {activeVariants[0]!.attributeLabel}
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {activeVariants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => {
                      setVariantId(v.id);
                      setQuantity(1);
                    }}
                    disabled={v.stock <= 0}
                    aria-pressed={variantId === v.id}
                    className={`rounded-full border px-4 py-2 text-sm disabled:opacity-40 ${
                      variantId === v.id
                        ? "border-transparent bg-foreground text-background"
                        : "border-border bg-surface"
                    }`}
                  >
                    {v.label}
                    {v.stock <= 0 && " — epuizat"}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-surface p-1">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Scade cantitatea"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full hover:bg-muted"
                aria-label="Crește cantitatea"
                onClick={() => setQuantity((q) => Math.min(product.stock || 1, q + 1))}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <button
              type="button"
              className="btn-dark flex-1"
              disabled={outOfStock}
              onClick={() => {
                addToCart(product.id, quantity, variant);
                toast.success("Produs adăugat în coș");
              }}
            >
              {outOfStock ? "Stoc epuizat" : "Adaugă în coș"}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-pressed={favorite}
              aria-label={favorite ? "Elimină de la favorite" : "Adaugă la favorite"}
              className="grid size-11 place-items-center rounded-full border border-border bg-surface"
            >
              <Heart className={`size-5 ${favorite ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>

          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Livrare prin curier în 1–3 zile lucrătoare. Transport gratuit la comenzi peste 250 lei.
            </li>
            <li className="flex items-start gap-3">
              <RotateCcw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Retur în 14 zile calendaristice, fără justificare.
            </li>
            <li className="flex items-start gap-3">
              <Shield className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Garanție 24 de luni pentru defecte de fabricație.
            </li>
          </ul>
        </div>
      </div>

      {similare.length > 0 && (
        <section className="mt-12" aria-labelledby="titlu-similare">
          <h2 id="titlu-similare" className="mb-4 font-display text-2xl font-semibold tracking-tight">
            Produse similare
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {similare.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
