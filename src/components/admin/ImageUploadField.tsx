import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";
import { resolveImage } from "@/lib/asset-map";
import { uploadCatalogImage } from "@/lib/product-images";

type Props = {
  id: string;
  label: string;
  kind: "categories" | "collections" | "brands";
  value: string;
  onChange: (value: string) => void;
};

/** Câmp cu încărcare de imagine în stocare + posibilitatea de a lipi un link. */
export function ImageUploadField({ id, label, kind, value, onChange }: Props) {
  const [seIncarca, setSeIncarca] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setSeIncarca(true);
    try {
      const { url } = await uploadCatalogImage(kind, file);
      onChange(url);
      toast.success("Imagine încărcată.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nu am putut încărca imaginea.");
    } finally {
      setSeIncarca(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <span className="text-sm font-semibold">{label}</span>
      <div className="mt-1.5 flex items-center gap-3">
        {value ? (
          <div className="relative">
            <img
              src={resolveImage(value)}
              alt=""
              width={80}
              height={80}
              className="size-14 rounded-xl border border-border object-cover"
            />
            <button
              type="button"
              aria-label="Elimină imaginea"
              className="absolute -right-2 -top-2 rounded-full border border-border bg-background p-1"
              onClick={() => onChange("")}
            >
              <X className="size-3" />
            </button>
          </div>
        ) : null}
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"
        >
          <Upload className="size-4" />
          {seIncarca ? "Se încarcă…" : value ? "Schimbă imaginea" : "Încarcă imagine"}
        </label>
      </div>
      <input
        className="field mt-2"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="sau lipește un link către imagine"
      />
      <p className="mt-1 text-xs text-muted-foreground">JPG, PNG sau WEBP, maximum 5 MB.</p>
    </div>
  );
}
