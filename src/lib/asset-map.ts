/**
 * Imaginile produselor sunt stocate în baza de date ca nume de fișier
 * (ex. `p-ruj-matte.jpg`). Aici le mapăm la fișierele împachetate de Vite,
 * păstrând în același timp suportul pentru URL-uri absolute (viitoarea
 * stocare de fișiere).
 */
const bundled = import.meta.glob("@/assets/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const byFileName = new Map<string, string>();
for (const [path, url] of Object.entries(bundled)) {
  const name = path.split("/").pop();
  if (name) byFileName.set(name, url);
}

export function resolveImage(value: string | undefined | null): string {
  if (!value) return "";
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) return value;
  const name = value.split("/").pop() ?? value;
  return byFileName.get(name) ?? value;
}

export function resolveImages(values: string[] | undefined | null): string[] {
  return (values ?? []).map(resolveImage).filter(Boolean);
}
