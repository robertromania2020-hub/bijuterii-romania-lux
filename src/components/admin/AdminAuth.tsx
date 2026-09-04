import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

type Stare = "verifica" | "neautentificat" | "fara-drepturi" | "admin";

export function AdminAuth({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [stare, setStare] = useState<Stare>("verifica");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) setStare("neautentificat");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setStare((s) => (s === "verifica" ? s : "neautentificat"));
      return;
    }
    let anulat = false;
    void (async () => {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (anulat) return;
      if (error) {
        setStare("fara-drepturi");
        return;
      }
      setStare(data ? "admin" : "fara-drepturi");
    })();
    return () => {
      anulat = true;
    };
  }, [session]);

  if (stare === "admin") return <>{children}</>;

  if (stare === "verifica") {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <p className="text-sm text-muted-foreground">Se verifică accesul…</p>
      </div>
    );
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Autentificare administrare
        </h1>
        {stare === "fara-drepturi" ? (
          <FaraDrepturi email={session?.user.email ?? ""} />
        ) : (
          <Autentificare />
        )}
      </div>
    </div>
  );
}

function FaraDrepturi({ email }: { email: string }) {
  return (
    <div className="mt-3 space-y-4 text-sm">
      <p className="text-muted-foreground">
        Contul <span className="font-semibold text-foreground">{email}</span> nu are drepturi de
        administrator. Cere unui administrator existent să îți acorde acces.
      </p>
      <button
        type="button"
        className="btn-soft"
        onClick={() => {
          void supabase.auth.signOut();
        }}
      >
        Ieși din cont
      </button>
    </div>
  );
}

function Autentificare() {
  const [mod, setMod] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [seTrimite, setSeTrimite] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@") || parola.length < 6) {
      toast.error("Introdu un email valid și o parolă de minimum 6 caractere.");
      return;
    }
    setSeTrimite(true);
    try {
      if (mod === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: parola });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: parola,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cont creat. Dacă este necesar, confirmă adresa de email.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Autentificare eșuată.");
    } finally {
      setSeTrimite(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Autentificarea cu Google a eșuat.");
      return;
    }
    if (result.redirected) return;
    window.location.assign("/admin");
  }

  return (
    <>
      <p className="mt-1 text-sm text-muted-foreground">
        Accesul la panoul de administrare este permis doar conturilor cu rol de administrator.
      </p>
      <form onSubmit={trimite} className="mt-5 space-y-4">
        <div>
          <label htmlFor="admin-email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="admin-email"
            type="email"
            autoComplete="email"
            className="field mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="admin-parola" className="text-sm font-semibold">
            Parolă
          </label>
          <input
            id="admin-parola"
            type="password"
            autoComplete={mod === "login" ? "current-password" : "new-password"}
            className="field mt-1.5"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-dark w-full" disabled={seTrimite}>
          {mod === "login" ? "Intră în cont" : "Creează cont"}
        </button>
      </form>

      <button type="button" className="btn-soft mt-3 w-full" onClick={() => void google()}>
        Continuă cu Google
      </button>

      <a
        href="/resetare-parola"
        className="mt-4 block text-center text-sm text-muted-foreground underline"
      >
        Ți-ai uitat parola?
      </a>

      <button
        type="button"
        className="mt-2 w-full text-sm text-muted-foreground underline"
        onClick={() => setMod(mod === "login" ? "signup" : "login")}
      >
        {mod === "login" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
      </button>

    </>
  );
}
