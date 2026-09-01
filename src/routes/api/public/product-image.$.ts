import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

/**
 * Servește public imaginile produselor din stocare (bucket privat
 * `product-images`), fără a expune cheile serverului.
 */
export const Route = createFileRoute("/api/public/product-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as Record<string, string>)["_splat"] ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const supabase = createClient(
          process.env["SUPABASE_URL"]!,
          process.env["SUPABASE_PUBLISHABLE_KEY"]!,
          { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
        );

        const { data, error } = await supabase.storage.from("product-images").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(data, {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
