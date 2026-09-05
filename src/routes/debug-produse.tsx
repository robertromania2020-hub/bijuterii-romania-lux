import { createFileRoute } from "@tanstack/react-router";
import { Route as ProduseRoute } from "./admin.produse";

const Comp = ProduseRoute.options.component as () => React.ReactElement;

export const Route = createFileRoute("/debug-produse")({
  ssr: false,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
  component: () => <Comp />,
});
