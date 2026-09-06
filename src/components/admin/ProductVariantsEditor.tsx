/**
 * Editorul de variante: pornește de la atributele marcate „generează variantă"
 * (mărime, lungime, nuanță, cantitate…) și creează câte un rând cu SKU, preț,
 * stoc și imagine proprie pentru fiecare valoare bifată.
 */
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import type { AttributeDefinition, AttributeValues, ProductVariant } from "@/data/types";
import { slugify } from "@/lib/admin-data";
import { resolveImage } from "@/lib/asset-map";

interface Props {
  productId: string;
  baseSku: string;
  variantDefs: AttributeDefinition[];
  attributes: AttributeValues;
  variants: ProductVariant[];
  images: string[];
  onAttributeChange: (key: string, values: string[]) => void;
  onVariantsChange: (variants: ProductVariant[]) => void;
  disabled?: boolean;
}

export function variantId(productId: string, key: string, value: string) {
  return `${productId}-${slugify(key, "_")}-${slugify(value) || "v"}`;
}

export function makeVariant(
  productId: string,
  baseSku: string,
  def: AttributeDefinition,
  value: string,
): ProductVariant {
  return {
    id: variantId(productId, def.key, value),
    attributeKey: def.key,
    attributeLabel: def.label,
    label: value,
    sku: `${baseSku || "SKU"}-${(slugify(value) || "v").toUpperCase()}`,
    barcode: null,
    price: null,
    oldPrice: null,
    stock: 0,
    minStock: 2,
    image: null,
    active: true,
  };
}

export function ProductVariantsEditor({
  productId,
  baseSku,
  variantDefs,
  attributes,
  variants,
  images,
  onAttributeChange,
  onVariantsChange,
  disabled,
}: Props) {
  const optionDefs = useMemo(
    () => variantDefs.filter((d) => d.type === "select" || d.type === "multi"),
    [variantDefs],
  );
  const freeDefs = useMemo(
    () => variantDefs.filter((d) => d.type !== "select" && d.type !== "multi"),
    [variantDefs],
  );

  const selectedOf = (def: AttributeDefinition): string[] => {
    const raw = attributes[def.key];
    return Array.isArray(raw) ? raw.map(String) : typeof raw === "string" && raw ? [raw] : [];
  };

  function syncOptions(def: AttributeDefinition, values: string[]) {
    onAttributeChange(def.key, values);
    const others = variants.filter((v) => v.attributeKey !== def.key);
    const kept = values.map((value) => {
      const id = variantId(productId, def.key, value);
      return (
        variants.find((v) => v.id === id || (v.attributeKey === def.key && v.label === value)) ??
        makeVariant(productId, baseSku, def, value)
      );
    });
    onVariantsChange([...others, ...kept]);
  }

  function updateVariant(id: string, patch: Partial<ProductVariant>) {
    onVariantsChange(variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function removeVariant(v: ProductVariant) {
    onVariantsChange(variants.filter((x) => x.id !== v.id));
    if (v.attributeKey) {
      const def = variantDefs.find((d) => d.key === v.attributeKey);
      if (def && (def.type === "select" || def.type === "multi")) {
        onAttributeChange(
          def.key,
          selectedOf(def).filter((o) => o !== v.label),
        );
      }
    }
  }

  function addFreeVariant(def: AttributeDefinition) {
    const value = window.prompt(`Adaugă o valoare pentru „${def.label}"`)?.trim();
    if (!value) return;
    const id = variantId(productId, def.key, value);
    if (variants.some((v) => v.id === id)) return;
    onVariantsChange([...variants, makeVariant(productId, baseSku, def, value)]);
  }

  if (variantDefs.length === 0) {
    return (
      <p className="rounded-2xl bg-muted p-3 text-sm text-muted-foreground">
        Această categorie nu are atribute care generează variante. Stocul se gestionează la nivel
        de produs.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {optionDefs.map((def) => {
        const selected = selectedOf(def);
        return (
          <fieldset key={def.id} className="rounded-2xl border border-border p-4">
            <legend className="px-1 text-sm font-semibold">
              {def.label}
              {def.required ? " *" : ""}
            </legend>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                className="btn-soft text-xs"
                disabled={disabled}
                onClick={() => syncOptions(def, def.options)}
              >
                Selectează tot
              </button>
              <button
                type="button"
                className="btn-soft text-xs"
                disabled={disabled}
                onClick={() => syncOptions(def, [])}
              >
                Deselectează tot
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {def.options.map((o) => {
                const on = selected.includes(o);
                const swatch = def.swatches[o];
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={disabled}
                    aria-pressed={on}
                    onClick={() =>
                      syncOptions(
                        def,
                        on ? selected.filter((s) => s !== o) : [...selected, o],
                      )
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                      on ? "border-transparent bg-foreground text-background" : "border-border bg-surface"
                    }`}
                  >
                    {swatch && (
                      <span
                        className="size-3 rounded-full border border-border"
                        style={{ backgroundColor: swatch }}
                        aria-hidden="true"
                      />
                    )}
                    {o}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}

      {freeDefs.map((def) => (
        <div key={def.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border p-4">
          <div>
            <p className="text-sm font-semibold">
              {def.label}
              {def.required ? " *" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Adaugă manual fiecare valoare (are SKU, stoc și imagine proprie).
            </p>
          </div>
          <button
            type="button"
            className="btn-soft"
            disabled={disabled}
            onClick={() => addFreeVariant(def)}
          >
            Adaugă {def.label.toLowerCase()}
          </button>
        </div>
      ))}

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[840px] text-sm">
            <caption className="sr-only">Variantele produsului</caption>
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2">Valoare</th>
                <th scope="col" className="px-3 py-2">SKU</th>
                <th scope="col" className="px-3 py-2">Preț</th>
                <th scope="col" className="px-3 py-2">Preț întreg</th>
                <th scope="col" className="px-3 py-2">Stoc</th>
                <th scope="col" className="px-3 py-2">Prag</th>
                <th scope="col" className="px-3 py-2">Cod de bare</th>
                <th scope="col" className="px-3 py-2">Imagine</th>
                <th scope="col" className="px-3 py-2">Activ</th>
                <th scope="col" className="px-3 py-2">Șterge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {variants.map((v) => (
                <tr key={v.id}>
                  <td className="px-3 py-2 font-semibold">
                    {v.label}
                    <span className="block text-xs font-normal text-muted-foreground">
                      {v.attributeLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`SKU pentru ${v.label}`}
                      className="field h-9"
                      value={v.sku}
                      disabled={disabled}
                      onChange={(e) => updateVariant(v.id, { sku: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Preț pentru ${v.label}`}
                      type="number"
                      min={0}
                      className="field h-9 w-24"
                      value={v.price ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        updateVariant(v.id, { price: e.target.value ? Number(e.target.value) : null })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Preț întreg pentru ${v.label}`}
                      type="number"
                      min={0}
                      className="field h-9 w-24"
                      value={v.oldPrice ?? ""}
                      disabled={disabled}
                      onChange={(e) =>
                        updateVariant(v.id, {
                          oldPrice: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Stoc pentru ${v.label}`}
                      type="number"
                      min={0}
                      className="field h-9 w-20"
                      value={v.stock}
                      disabled={disabled}
                      onChange={(e) => updateVariant(v.id, { stock: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Prag stoc redus pentru ${v.label}`}
                      type="number"
                      min={0}
                      className="field h-9 w-20"
                      value={v.minStock}
                      disabled={disabled}
                      onChange={(e) => updateVariant(v.id, { minStock: Number(e.target.value) })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input
                      aria-label={`Cod de bare pentru ${v.label}`}
                      className="field h-9 w-32"
                      value={v.barcode ?? ""}
                      disabled={disabled}
                      onChange={(e) => updateVariant(v.id, { barcode: e.target.value || null })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      {v.image && (
                        <img
                          src={resolveImage(v.image)}
                          alt=""
                          width={64}
                          height={64}
                          className="size-8 rounded-lg object-cover"
                        />
                      )}
                      <select
                        aria-label={`Imagine pentru ${v.label}`}
                        className="field h-9 w-36"
                        value={v.image ?? ""}
                        disabled={disabled}
                        onChange={(e) => updateVariant(v.id, { image: e.target.value || null })}
                      >
                        <option value="">Imaginea produsului</option>
                        {images.map((img, i) => (
                          <option key={img} value={img}>
                            Imaginea {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Varianta ${v.label} este activă`}
                      className="size-4 accent-primary"
                      checked={v.active}
                      disabled={disabled}
                      onChange={(e) => updateVariant(v.id, { active: e.target.checked })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      className="btn-soft text-destructive"
                      aria-label={`Șterge varianta ${v.label}`}
                      disabled={disabled}
                      onClick={() => removeVariant(v)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
