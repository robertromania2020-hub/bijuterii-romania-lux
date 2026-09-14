import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Comanda online a fost dezactivată: toate comenzile se fac prin WhatsApp,
 * direct din coș. Ruta veche redirecționează către coș.
 */
export const Route = createFileRoute("/checkout")({
  beforeLoad: () => {
    throw redirect({ to: "/cos" });
  },
  component: () => null,
});
