/**
 * Webhook Stripe — singurul loc unde o comandă poate fi marcată drept plătită.
 * Semnătura este verificată, iar evenimentele sunt idempotente prin `stripe_events`.
 */
import { createFileRoute } from "@tanstack/react-router";
import { verifyStripeSignature } from "@/lib/stripe.server";

type Json = Record<string, unknown>;

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const event = await verifyStripeSignature(rawBody, request.headers.get("stripe-signature"));
        if (!event) return new Response("Semnătură invalidă", { status: 401 });

        const type = String(event["type"] ?? "");
        const object = ((event["data"] as Json | undefined)?.["object"] as Json | undefined) ?? {};
        const metadata = (object["metadata"] as Json | undefined) ?? {};
        const orderId = str(metadata["order_id"]) ?? str(object["client_reference_id"]);

        let outcome: "paid" | "failed" | "cancelled" | null = null;
        let sessionId: string | null = null;
        let paymentIntentId: string | null = null;

        switch (type) {
          case "checkout.session.completed":
          case "checkout.session.async_payment_succeeded": {
            sessionId = str(object["id"]);
            paymentIntentId = str(object["payment_intent"]);
            outcome = String(object["payment_status"] ?? "") === "paid" ? "paid" : null;
            break;
          }
          case "checkout.session.async_payment_failed": {
            sessionId = str(object["id"]);
            paymentIntentId = str(object["payment_intent"]);
            outcome = "failed";
            break;
          }
          case "checkout.session.expired": {
            sessionId = str(object["id"]);
            outcome = "cancelled";
            break;
          }
          case "payment_intent.payment_failed": {
            paymentIntentId = str(object["id"]);
            outcome = "failed";
            break;
          }
          default:
            outcome = null;
        }

        if (!outcome || !orderId) return new Response("ok");

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.rpc("apply_stripe_payment_event", {
          p_event_id: String(event["id"] ?? ""),
          p_event_type: type,
          p_order_id: orderId,
          p_outcome: outcome,
          p_session_id: sessionId ?? undefined,
          p_payment_intent_id: paymentIntentId ?? undefined,
        });

        if (error) {
          console.error("Eroare la aplicarea evenimentului Stripe:", error.message);
          return new Response("Eroare internă", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
