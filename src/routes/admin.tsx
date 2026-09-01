import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminAuth } from "@/components/admin/AdminAuth";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: () => (
    <AdminAuth>
      <Outlet />
    </AdminAuth>
  ),
});
