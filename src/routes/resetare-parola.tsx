import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeading, SiteLayout } from "@/components/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import { mesajEroare } from "@/lib/shop-data";

export const Route = createFileRoute("/resetare-parola")({
  head: () => ({
    meta: [
      { title: "Resetare parolă | Casa Elegantei" },
      {
        name: "description",
        content:
          "Recuperează accesul la contul tău Casa Elegantei: primești un email cu link pentru setarea unei parole noi.",
      },
      { property: "og:title", content: "Resetare parolă | Casa Elegantei" },
      { property: "og:description", content: "Setează o parolă nouă pentru contul tău." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetarePage,
});

function ResetarePage() {
  const [modSetare, setModSetare] = useState(false);
  const [verifica, setVerifica] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setModSetare(true);
        setVerifica(false);
      }
    });
    void supabase.auth.getSession().then(({ data }) => {
      const areLink =
        typeof window !== "undefined" &&
        (window.location.hash.includes("access_token") ||
          window.location.hash.includes("type=recovery") ||
          window.location.search.includes("code="));
      if (data.session && areLink) setModSetare(true);
      setVerifica(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (verifica) {
    return (
      <SiteLayout>
        <PageHeading eyebrow="Cont" title="Resetare parolă" />
        <p className="mt-6 text-sm text-muted-foreground">Se verifică linkul…</p>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeading
        eyebrow="Cont"
        title={modSetare ? "Setează o parolă nouă" : "Ți-ai uitat parola?"}
      />
      <div className="mx-auto mt-6 w-full max-w-md rounded-3xl border border-border bg-surface p-6">
        {modSetare ? <FormularParolaNoua /> : <FormularCerere />}
      </div>
    </SiteLayout>
  );
}

function FormularCerere() {
  const [email, setEmail] = useState("");
  const [seLucreaza, setSeLucreaza] = useState(false);
  const [trimis, setTrimis] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    setSeLucreaza(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/resetare-parola`,
      });
      if (error) throw error;
      setTrimis(true);
      toast.success("Ți-am trimis un email cu instrucțiuni.");
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut trimite emailul de resetare."));
    } finally {
      setSeLucreaza(false);
    }
  }

  if (trimis) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Dacă adresa <span className="font-semibold text-foreground">{email}</span> există în
          magazin, vei primi în câteva minute un email cu un link pentru setarea unei parole noi.
          Verifică și folderul Spam.
        </p>
        <Link to="/cont" className="btn-soft inline-flex">
          Înapoi la autentificare
        </Link>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Scrie adresa de email cu care te-ai înregistrat și îți trimitem un link pentru a-ți alege o
        parolă nouă.
      </p>
      <form onSubmit={(e) => void trimite(e)} className="mt-4 space-y-3">
        <div>
          <label htmlFor="reset-email" className="text-sm font-semibold">
            Email
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            className="field mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-dark w-full" disabled={seLucreaza}>
          Trimite linkul de resetare
        </button>
      </form>
      <Link to="/cont" className="mt-4 block text-center text-sm text-muted-foreground underline">
        Înapoi la autentificare
      </Link>
    </>
  );
}

function FormularParolaNoua() {
  const [parola, setParola] = useState("");
  const [confirmare, setConfirmare] = useState("");
  const [seLucreaza, setSeLucreaza] = useState(false);
  const [gata, setGata] = useState(false);

  async function trimite(e: React.FormEvent) {
    e.preventDefault();
    if (parola.length < 6) {
      toast.error("Parola trebuie să aibă minimum 6 caractere.");
      return;
    }
    if (parola !== confirmare) {
      toast.error("Cele două parole nu coincid.");
      return;
    }
    setSeLucreaza(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: parola });
      if (error) throw error;
      setGata(true);
      toast.success("Parola a fost schimbată.");
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut schimba parola. Cere un link nou."));
    } finally {
      setSeLucreaza(false);
    }
  }

  if (gata) {
    return (
      <div className="space-y-4 text-sm">
        <p className="text-muted-foreground">
          Parola a fost schimbată cu succes. Poți intra acum în contul tău.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/cont" className="btn-dark inline-flex">
            Mergi la contul meu
          </Link>
          <Link to="/admin" className="btn-soft inline-flex">
            Panou administrare
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Alege o parolă nouă, de minimum 6 caractere.
      </p>
      <form onSubmit={(e) => void trimite(e)} className="mt-4 space-y-3">
        <div>
          <label htmlFor="parola-noua" className="text-sm font-semibold">
            Parolă nouă
          </label>
          <input
            id="parola-noua"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field mt-1.5"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="parola-confirmare" className="text-sm font-semibold">
            Confirmă parola
          </label>
          <input
            id="parola-confirmare"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className="field mt-1.5"
            value={confirmare}
            onChange={(e) => setConfirmare(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-dark w-full" disabled={seLucreaza}>
          Salvează parola nouă
        </button>
      </form>
    </>
  );
}
