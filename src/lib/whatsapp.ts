/**
 * Comandă simplă prin WhatsApp: construiește linkul oficial wa.me cu un
 * mesaj precompletat. Nu există nicio integrare API și nu se creează nicio
 * comandă în baza de date — doar se deschide conversația.
 */
import { SHOP_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/data/company";
import { formatPrice } from "@/lib/format";

export interface WhatsAppOrderInput {
  /** Numele produsului, exact ca în catalog. */
  productName: string;
  /** SKU-ul variantei selectate sau al produsului. */
  sku: string;
  /** Eticheta atributului variantei: „Mărime", „Nuanță", „Culoare"… */
  variantLabel?: string | null;
  /** Valoarea variantei selectate: „54", „Gold"… */
  variantValue?: string | null;
  quantity: number;
  /** Prețul unitar afișat clientului (în lei). */
  price: number;
  /** Slug-ul produsului, folosit pentru linkul public. */
  slug: string;
}

/** URL-ul public al produsului, pe domeniul magazinului dacă e disponibil. */
export function productUrl(slug: string): string {
  const base =
    SITE_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  return `${base.replace(/\/$/, "")}/produs/${slug}`;
}

/** Textul mesajului trimis pe WhatsApp (fără encodare). */
export function buildWhatsAppMessage(input: WhatsAppOrderInput): string {
  const linii = [
    `Bună! Doresc să comand de pe ${SHOP_NAME}:`,
    "",
    `💎 Produs: ${input.productName}`,
    `🔖 Cod produs: ${input.sku}`,
  ];
  if (input.variantValue) {
    linii.push(`📏 ${input.variantLabel || "Variantă"}: ${input.variantValue}`);
  }
  linii.push(
    `🔢 Cantitate: ${input.quantity}`,
    `💰 Preț afișat: ${formatPrice(input.price)}`,
    `🔗 Link produs: ${productUrl(input.slug)}`,
    "",
    "Vă rog să mă contactați pentru confirmarea comenzii și stabilirea livrării.",
  );
  return linii.join("\n");
}

/** Linkul oficial wa.me, cu mesajul corect URL-encoded. */
export function whatsAppOrderLink(input: WhatsAppOrderInput): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(input))}`;
}

export interface WhatsAppCartLine {
  productName: string;
  sku: string;
  variantValue?: string | null;
  quantity: number;
  unitPrice: number;
  slug: string;
}

/** Mesaj pentru întregul coș, trimis pe WhatsApp. */
export function buildWhatsAppCartMessage(lines: WhatsAppCartLine[], total: number): string {
  const linii = [`Bună! Doresc să comand de pe ${SHOP_NAME}:`, ""];
  lines.forEach((line, index) => {
    linii.push(
      `${index + 1}) ${line.productName}${line.variantValue ? ` — ${line.variantValue}` : ""}`,
      `   🔖 Cod: ${line.sku}`,
      `   🔢 Cantitate: ${line.quantity} × ${formatPrice(line.unitPrice)}`,
      `   🔗 ${productUrl(line.slug)}`,
    );
  });
  linii.push(
    "",
    `💰 Total produse: ${formatPrice(total)}`,
    "",
    "Vă rog să mă contactați pentru confirmarea comenzii și stabilirea livrării.",
  );
  return linii.join("\n");
}

/** Linkul wa.me pentru comanda întregului coș. */
export function whatsAppCartLink(lines: WhatsAppCartLine[], total: number): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppCartMessage(lines, total))}`;
}

/** Link simplu de contact pe WhatsApp, fără produs. */
export function whatsAppContactLink(text?: string): string {
  const mesaj = text ?? `Bună! Am o întrebare despre produsele ${SHOP_NAME}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mesaj)}`;
}
