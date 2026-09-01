import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Star, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/lib/asset-map";
import {
  removeStorageFiles,
  uploadProductImage,
  type ProductImage,
} from "@/lib/product-images";

type Props = {
  productId: string;
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  disabled?: boolean;
};

export function ProductImagesEditor({ productId, images, onChange, disabled }: Props) {
  const [seIncarca, setSeIncarca] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setSeIncarca(true);
    const adaugate: ProductImage[] = [];
    for (const file of Array.from(files)) {
      try {
        const { storagePath, url } = await uploadProductImage(productId, file);
        adaugate.push({ id: null, url, storagePath, isPrimary: false });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Nu am putut încărca imaginea.");
      }
    }
    if (adaugate.length > 0) {
      const total = [...images, ...adaugate];
      if (!total.some((i) => i.isPrimary)) total[0]!.isPrimary = true;
      onChange(total);
      toast.success(adaugate.length === 1 ? "Imagine încărcată." : "Imagini încărcate.");
    }
    setSeIncarca(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function sterge(index: number) {
    const img = images[index];
    if (!img) return;
    try {
      if (img.storagePath) await removeStorageFiles([img.storagePath]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut șterge imaginea.");
      return;
    }
    const rest = images.filter((_, i) => i !== index);
    if (rest.length > 0 && !rest.some((i) => i.isPrimary)) rest[0] = { ...rest[0]!, isPrimary: true };
    onChange(rest);
  }

  function muta(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const copie = [...images];
    const [item] = copie.splice(index, 1);
    copie.splice(target, 0, item!);
    onChange(copie);
  }

  function seteazaPrincipala(index: number) {
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          id="p-imagini"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          disabled={disabled || seIncarca}
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <button
          type="button"
          className="btn-soft inline-flex items-center gap-2"
          disabled={disabled || seIncarca}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" aria-hidden="true" />
          {seIncarca ? "Se încarcă imaginea…" : "Încarcă imagini"}
        </button>
        <p className="text-xs text-muted-foreground">JPG, PNG sau WEBP, maxim 5 MB per imagine.</p>
      </div>

      {images.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((img, index) => (
            <li key={img.storagePath ?? img.url} className="rounded-2xl border border-border p-2">
              <img
                src={resolveImage(img.url)}
                alt={`Imagine produs ${index + 1}`}
                loading="lazy"
                className="aspect-square w-full rounded-xl object-cover"
              />
              <div className="mt-2 flex items-center justify-between gap-1">
                <button
                  type="button"
                  className={`btn-soft px-2 ${img.isPrimary ? "text-primary" : ""}`}
                  aria-label={`Setează ca imagine principală ${index + 1}`}
                  onClick={() => seteazaPrincipala(index)}
                >
                  <Star className={`size-4 ${img.isPrimary ? "fill-current" : ""}`} />
                </button>
                <button type="button" className="btn-soft px-2" aria-label="Mută la stânga" onClick={() => muta(index, -1)}>
                  <ArrowLeft className="size-4" />
                </button>
                <button type="button" className="btn-soft px-2" aria-label="Mută la dreapta" onClick={() => muta(index, 1)}>
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  className="btn-soft px-2 text-destructive"
                  aria-label="Șterge imaginea"
                  onClick={() => void sterge(index)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              {img.isPrimary && (
                <p className="mt-1 text-center text-[11px] font-semibold text-primary">Principală</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
