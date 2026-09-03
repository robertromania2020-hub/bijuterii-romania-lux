/**
 * Helper server-only pentru Stripe. Cheia secretă este citită din
 * variabilele de mediu ale serverului și nu ajunge niciodată în browser.
 */

const STRIPE_API = "https://api.stripe.com/v1";

function secretKey(): string {
  const key = process.env["STRIPE_SECRET_KEY"];
  if (!key) throw new Error("Plata online nu este configurată.");
  return key;
}

/** Serializează un obiect în formatul form-encoded cerut de Stripe. */
function encode(params: Record<string, unknown>, prefix = ""): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === "object" && item !== null) {
          out.push(...encode(item as Record<string, unknown>, `${key}[${i}]`));
        } else {
          out.push(`${encodeURIComponent(`${key}[${i}]`)}=${encodeURIComponent(String(item))}`);
        }
      });
    } else if (typeof v === "object") {
      out.push(...encode(v as Record<string, unknown>, key));
    } else {
      out.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`);
    }
  }
  return out;
}

export async function stripeRequest<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: Record<string, unknown>; idempotencyKey?: string } = {},
): Promise<T> {
  const method = options.method ?? "POST";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secretKey()}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (options.idempotencyKey) headers["Idempotency-Key"] = options.idempotencyKey;

  const res = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers,
    ...(options.body ? { body: encode(options.body).join("&") } : {}),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`Stripe ${path} a răspuns ${res.status}: ${text}`);
    throw new Error("Nu am putut iniția plata online. Te rugăm să încerci din nou.");
  }
  return JSON.parse(text) as T;
}

/** RON în bani (cea mai mică unitate), fără erori de virgulă mobilă. */
export function toBani(value: number): number {
  return Math.round(Number(value) * 100);
}

/* --------------------- verificarea semnăturii webhook -------------------- */

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verifică antetul `stripe-signature` peste corpul brut al cererii.
 * Returnează evenimentul doar dacă semnătura este validă.
 */
export async function verifyStripeSignature(
  rawBody: string,
  signatureHeader: string | null,
  toleranceSeconds = 300,
): Promise<Record<string, unknown> | null> {
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!secret || !signatureHeader) return null;

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => {
      const [k, ...rest] = p.split("=");
      return [k?.trim() ?? "", rest.join("=")];
    }),
  ) as Record<string, string>;

  const timestamp = parts["t"];
  const provided = parts["v1"];
  if (!timestamp || !provided) return null;

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (!Number.isFinite(age) || age > toleranceSeconds) return null;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${rawBody}`));
  const expected = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (!timingSafeEqual(expected, provided)) return null;
  return JSON.parse(rawBody) as Record<string, unknown>;
}
