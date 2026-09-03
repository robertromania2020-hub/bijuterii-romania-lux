/**
 * Creează sesiunea Stripe Checkout pentru o comandă existentă.
 * Toate sumele sunt citite din baza de date (order_items), niciodată din browser.
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { stripeRequest, toBani } from "@/lib/stripe.server";

interface StripeSession {
  id: string;
  url: string | null;
  payment_intent?: string | null;
}

function originFromRequest(): string {
  const req = getRequest();
  const url = new URL(req.url);
  const forwardedHost = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return forwardedHost ? `${proto}://${forwardedHost}` : url.origin;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { orderId: string }) => {
    if (!data || typeof data.orderId !== "string" || data.orderId.length < 8) {
      throw new Error("Comanda nu a fost găsită.");
    }
    return { orderId: data.orderId };
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: order, error } = await supabase
      .from("orders")
      .select("id, number, user_id, total, shipping, payment_method, payment_status, customer_email, order_items(*)")
      .eq("id", data.orderId)
      .maybeSingle();

    if (error || !order) throw new Error("Comanda nu a fost găsită.");
    if (order.user_id !== userId) throw new Error("Comanda nu a fost găsită.");
    if (order.payment_method !== "card") throw new Error("Comanda nu necesită plată online.");
    if (order.payment_status === "paid") throw new Error("Comanda este deja plătită.");
    if (order.payment_status !== "pending") throw new Error("Plata pentru această comandă nu mai poate fi reluată.");

    const origin = originFromRequest();
    const items = (order.order_items ?? []) as Array<Record<string, unknown>>;
    if (items.length === 0) throw new Error("Comanda nu conține produse.");

    const lineItems = items.map((it) => {
      const quantity = Number(it["quantity"] ?? 1);
      const total = Number(it["total"] ?? 0);
      const unitBani = Math.round(toBani(total) / quantity);
      const variant = it["variant_name_snapshot"] as string | null;
      const image = it["product_image_snapshot"] as string | null;
      const absoluteImage =
        image && image.startsWith("/") ? `${origin}${image}` : image && image.startsWith("http") ? image : null;

      return {
        quantity,
        price_data: {
          currency: "ron",
          unit_amount: unitBani,
          product_data: {
            name: String(it["product_name_snapshot"] ?? "Produs"),
            ...(variant ? { description: variant } : {}),
            ...(absoluteImage ? { images: [absoluteImage] } : {}),
          },
        },
      };
    });

    const shipping = Number(order.shipping ?? 0);
    if (shipping > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "ron",
          unit_amount: toBani(shipping),
          product_data: { name: "Transport" },
        },
      });
    }

    const session = await stripeRequest<StripeSession>("/checkout/sessions", {
      body: {
        mode: "payment",
        line_items: lineItems,
        currency: "ron",
        client_reference_id: order.id,
        customer_email: order.customer_email,
        locale: "ro",
        metadata: { order_id: order.id, order_number: order.number },
        payment_intent_data: { metadata: { order_id: order.id, order_number: order.number } },
        success_url: `${origin}/comanda/succes?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/checkout?payment=cancelled&order=${order.id}`,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
      },
      idempotencyKey: `order-${order.id}`,
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("orders")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", order.id);

    if (!session.url) throw new Error("Nu am putut iniția plata online. Te rugăm să încerci din nou.");
    return { url: session.url, sessionId: session.id };
  });

/** Verifică starea plății pentru pagina de succes (fără a marca plata). */
export const getPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string }) => {
    if (!data || typeof data.sessionId !== "string" || !data.sessionId.startsWith("cs_")) {
      throw new Error("Sesiune de plată invalidă.");
    }
    return { sessionId: data.sessionId };
  })
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .select("number, total, payment_status, status, payment_method")
      .eq("stripe_checkout_session_id", data.sessionId)
      .maybeSingle();

    if (error || !order) return null;
    return {
      number: order.number,
      total: Number(order.total ?? 0),
      paymentStatus: String(order.payment_status ?? "pending"),
      status: String(order.status ?? "noua"),
    };
  });
