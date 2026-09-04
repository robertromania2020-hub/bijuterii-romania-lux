import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDate } from "@/lib/format";
import { mesajEroare } from "@/lib/shop-data";

export const Route = createFileRoute("/admin/utilizatori")({
  head: () => ({
    meta: [
      { title: "Utilizatori — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea utilizatorilor și a rolurilor de administrator." },
      { property: "og:title", content: "Utilizatori — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Gestionează rolurile utilizatorilor." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminUtilizatori,
});

interface UtilizatorRand {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  roles: string[];
}

function AdminUtilizatori() {
  const [rows, setRows] = useState<UtilizatorRand[]>([]);
  const [cautare, setCautare] = useState("");
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState<string | null>(null);
  const [seSalveaza, setSeSalveaza] = useState<string | null>(null);

  async function incarca() {
    const { data, error } = await supabase.rpc("admin_users");
    if (error) setEroare(mesajEroare(error, "Nu am putut încărca lista de utilizatori."));
    else {
      setEroare(null);
      setRows(
        (data ?? []).map((r) => ({
          userId: r.user_id as string,
          email: r.email ?? "",
          firstName: (r.first_name as string) ?? "",
          lastName: (r.last_name as string) ?? "",
          createdAt: String(r.created_at ?? ""),
          roles: ((r.roles as string[] | null) ?? []).filter(Boolean),
        })),
      );
    }
    setLoading(false);
  }

  useEffect(() => {
    void incarca();
  }, []);

  async function schimbaRol(u: UtilizatorRand, acorda: boolean) {
    setSeSalveaza(u.userId);
    try {
      const { error } = await supabase.rpc("set_user_role", {
        p_user_id: u.userId,
        p_role: "admin",
        p_grant: acorda,
      });
      if (error) throw error;
      toast.success(
        acorda
          ? `${u.email} este acum administrator.`
          : `Rolul de administrator a fost retras pentru ${u.email}.`,
      );
      await incarca();
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut modifica rolul."));
    } finally {
      setSeSalveaza(null);
    }
  }

  const filtrati = rows.filter((u) => {
    const q = cautare.trim().toLowerCase();
    if (!q) return true;
    return (
      u.email.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  });

  return (
    <AdminShell
      title="Utilizatori"
      description="Gestionează conturile și rolurile de administrator."
    >
      <div className="rounded-3xl border border-border bg-surface p-4 sm:p-6">
        <input
          type="search"
          placeholder="Caută după nume sau email…"
          className="field mb-4 max-w-sm"
          value={cautare}
          onChange={(e) => setCautare(e.target.value)}
          aria-label="Caută utilizatori"
        />
        {eroare ? <p className="mb-3 text-sm text-destructive">{eroare}</p> : null}
        {loading ? (
          <p className="text-sm text-muted-foreground">Se încarcă…</p>
        ) : filtrati.length === 0 ? (
          <p className="text-sm text-muted-foreground">Niciun utilizator găsit.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-semibold">Utilizator</th>
                  <th className="py-2 pr-4 font-semibold">Email</th>
                  <th className="py-2 pr-4 font-semibold">Înregistrat</th>
                  <th className="py-2 pr-4 font-semibold">Rol</th>
                  <th className="py-2 font-semibold">Acțiuni</th>
                </tr>
              </thead>
              <tbody>
                {filtrati.map((u) => {
                  const esteAdmin = u.roles.includes("admin");
                  return (
                    <tr key={u.userId} className="border-b border-border/60 last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {`${u.firstName} ${u.lastName}`.trim() || "—"}
                      </td>
                      <td className="py-3 pr-4">{u.email}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {u.createdAt ? formatDate(u.createdAt) : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            esteAdmin
                              ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                              : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                          }
                        >
                          {esteAdmin ? "Administrator" : "Utilizator"}
                        </span>
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          className="btn-soft inline-flex items-center gap-1.5 text-xs"
                          disabled={seSalveaza === u.userId}
                          onClick={() => void schimbaRol(u, !esteAdmin)}
                        >
                          {esteAdmin ? (
                            <>
                              <ShieldOff className="h-3.5 w-3.5" /> Retrage admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-3.5 w-3.5" /> Fă administrator
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
