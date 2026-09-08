import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminCard, AdminShell, AdminTable, Pill } from "@/components/admin/AdminShell";
import {
  ORDER_SOURCE_LABELS,
  ORDER_STATUS_LABELS,
  type OrderSource,
  type OrderStatus,
} from "@/data/types";
import { SHIPPING_COST } from "@/data/company";
import { formatDate, formatPrice } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import {
  formatShippingAddress,
  mapCustomerOrder,

  mesajEroare,
  ORDER_SELECT,
  type CustomerOrder,
} from "@/lib/shop-data";
import {
  createManualOrder,
  mapProduct,
  setOrderStatus,
  updateOrderFields,
  useLiveTable,
} from "@/lib/admin-data";
import { formatPrice as lei } from "@/lib/format";
import type { Product } from "@/data/types";

export const Route = createFileRoute("/admin/comenzi")({
  head: () => ({
    meta: [
      { title: "Comenzi — Administrare | Casa Elegantei" },
      { name: "description", content: "Gestionarea comenzilor și a statusurilor de livrare." },
      { property: "og:title", content: "Comenzi — Administrare | Casa Elegantei" },
      { property: "og:description", content: "Comenzile magazinului." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminComenzi,
});

const STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "În așteptarea plății",
  paid: "Plătită",
  failed: "Plată eșuată",
  refunded: "Rambursată",
  cancelled: "Anulată",
};

interface ComandaAdmin extends CustomerOrder {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  county: string;
  adminNotes: string;
  customerNotes: string;
  paidAt: string | null;

  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  orderSource: OrderSource;
}

function mapAdminOrder(row: Record<string, unknown>): ComandaAdmin {
  return {
    ...mapCustomerOrder(row),
    customerName: String(row["customer_name"] ?? ""),
    customerEmail: String(row["customer_email"] ?? ""),
    customerPhone: String(row["customer_phone"] ?? ""),
    city: String(row["city"] ?? ""),
    county: String(row["county"] ?? ""),
    adminNotes: String(row["admin_notes"] ?? ""),
    customerNotes: String(row["customer_notes"] ?? ""),
    paidAt: (row["paid_at"] as string | null) ?? null,
    stripeSessionId: (row["stripe_checkout_session_id"] as string | null) ?? null,
    stripePaymentIntentId: (row["stripe_payment_intent_id"] as string | null) ?? null,
    orderSource: (String(row["order_source"] ?? "online") as OrderSource) ?? "online",
  };
}

/** Formular pentru înregistrarea manuală a unei comenzi primite pe WhatsApp. */
function FormularComandaWhatsApp({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { rows: produse, loading } = useLiveTable<Product>("products", mapProduct, {
    column: "name",
    ascending: true,
  });
  const [productId, setProductId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [cantitate, setCantitate] = useState(1);
  const [nume, setNume] = useState("");
  const [telefon, setTelefon] = useState("");
  const [email, setEmail] = useState("");
  const [judet, setJudet] = useState("");
  const [oras, setOras] = useState("");
  const [adresa, setAdresa] = useState("");
  const [metoda, setMetoda] = useState<"ramburs" | "card" | "transfer">("ramburs");
  const [sursa, setSursa] = useState<"whatsapp" | "telefon">("whatsapp");
  const [transport, setTransport] = useState(String(SHIPPING_COST));
  const [observatii, setObservatii] = useState("");
  const [saving, setSaving] = useState(false);

  const produs = useMemo(() => produse.find((p) => p.id === productId) ?? null, [produse, productId]);
  const variante = produs?.variants.filter((v) => v.active) ?? [];
  const varianta = variante.find((v) => v.id === variantId) ?? null;
  const pret = varianta?.price ?? produs?.price ?? 0;
  const stoc = varianta ? varianta.stock : (produs?.stock ?? 0);

  async function salveaza() {
    if (!produs) {
      toast.error("Alege un produs.");
      return;
    }
    if (variante.length > 0 && !varianta) {
      toast.error("Alege varianta produsului.");
      return;
    }
    if (cantitate < 1 || cantitate > stoc) {
      toast.error(`Stoc disponibil: ${stoc} bucăți.`);
      return;
    }
    setSaving(true);
    try {
      const rezultat = await createManualOrder({
        items: [{ product_id: produs.id, variant_id: varianta?.id ?? null, quantity: cantitate }],
        customer: { name: nume.trim(), phone: telefon.trim(), email: email.trim() },
        shipping: { county: judet.trim(), city: oras.trim(), address: adresa.trim(), recipient: nume.trim(), phone: telefon.trim() },
        paymentMethod: metoda,
        shippingCost: Number(transport) || 0,
        adminNotes: observatii.trim(),
        source: sursa,
      });
      toast.success(`Comanda ${rezultat.number} a fost înregistrată.`);
      onSaved();
      onClose();
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut înregistra comanda."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminCard className="mb-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Comandă nouă din WhatsApp</h2>
        <button type="button" className="btn-soft" onClick={onClose}>
          Închide
        </button>
      </div>
      {loading && <p className="mt-3 text-sm text-muted-foreground">Se încarcă produsele…</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor="wa-produs" className="text-sm font-semibold">Produs</label>
          <select
            id="wa-produs"
            className="field mt-1.5"
            value={productId}
            onChange={(e) => {
              setProductId(e.target.value);
              setVariantId("");
              setCantitate(1);
            }}
          >
            <option value="">Alege produsul…</option>
            {produse.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.sku}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wa-varianta" className="text-sm font-semibold">Variantă</label>
          <select
            id="wa-varianta"
            className="field mt-1.5"
            value={variantId}
            disabled={variante.length === 0}
            onChange={(e) => {
              setVariantId(e.target.value);
              setCantitate(1);
            }}
          >
            <option value="">{variante.length === 0 ? "Fără variante" : "Alege varianta…"}</option>
            {variante.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.attributeLabel}: {v.label} — stoc {v.stock}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="wa-cantitate" className="text-sm font-semibold">
            Cantitate (stoc disponibil: {stoc})
          </label>
          <input
            id="wa-cantitate"
            type="number"
            min={1}
            max={Math.max(1, stoc)}
            className="field mt-1.5"
            value={cantitate}
            onChange={(e) => setCantitate(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <div>
          <span className="text-sm font-semibold">Preț din catalog</span>
          <p className="field mt-1.5 bg-muted">
            {lei(pret)} × {cantitate} = {lei(pret * cantitate)}
          </p>
        </div>
        <div>
          <label htmlFor="wa-nume" className="text-sm font-semibold">Client</label>
          <input id="wa-nume" className="field mt-1.5" value={nume} onChange={(e) => setNume(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-telefon" className="text-sm font-semibold">Telefon</label>
          <input id="wa-telefon" className="field mt-1.5" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-email" className="text-sm font-semibold">E-mail (opțional)</label>
          <input id="wa-email" type="email" className="field mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-judet" className="text-sm font-semibold">Județ</label>
          <input id="wa-judet" className="field mt-1.5" value={judet} onChange={(e) => setJudet(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-oras" className="text-sm font-semibold">Localitate</label>
          <input id="wa-oras" className="field mt-1.5" value={oras} onChange={(e) => setOras(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-adresa" className="text-sm font-semibold">Adresă</label>
          <input id="wa-adresa" className="field mt-1.5" value={adresa} onChange={(e) => setAdresa(e.target.value)} />
        </div>
        <div>
          <label htmlFor="wa-plata" className="text-sm font-semibold">Metodă de plată</label>
          <select
            id="wa-plata"
            className="field mt-1.5"
            value={metoda}
            onChange={(e) => setMetoda(e.target.value as typeof metoda)}
          >
            <option value="ramburs">Ramburs la livrare</option>
            <option value="card">Card online</option>
            <option value="transfer">Transfer bancar</option>
          </select>
        </div>
        <div>
          <label htmlFor="wa-sursa" className="text-sm font-semibold">Sursa comenzii</label>
          <select
            id="wa-sursa"
            className="field mt-1.5"
            value={sursa}
            onChange={(e) => setSursa(e.target.value as typeof sursa)}
          >
            <option value="whatsapp">WhatsApp</option>
            <option value="telefon">Telefon</option>
          </select>
        </div>
        <div>
          <label htmlFor="wa-transport" className="text-sm font-semibold">Cost transport (lei)</label>
          <input
            id="wa-transport"
            type="number"
            min={0}
            className="field mt-1.5"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="wa-obs" className="text-sm font-semibold">Observații</label>
          <textarea
            id="wa-obs"
            rows={2}
            className="field mt-1.5"
            value={observatii}
            onChange={(e) => setObservatii(e.target.value)}
          />
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Prețul este preluat automat din catalog și nu poate fi modificat manual. Comanda se salvează
        cu statusul „{ORDER_STATUS_LABELS.whatsapp_asteptare}" și scade stocul.
      </p>
      <button type="button" className="btn-dark mt-4" disabled={saving} onClick={() => void salveaza()}>
        {saving ? "Se salvează…" : "Înregistrează comanda"}
      </button>
    </AdminCard>
  );
}

function AdminComenzi() {
  const [rows, setRows] = useState<ComandaAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus | "toate">("toate");
  const [cautare, setCautare] = useState("");
  const [dela, setDela] = useState("");
  const [panaLa, setPanaLa] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [awb, setAwb] = useState("");
  const [formularWa, setFormularWa] = useState(false);

  async function incarca() {
    const { data, error: err } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("created_at", { ascending: false });
    if (err) setError(mesajEroare(err, "Nu am putut încărca comenzile."));
    else {
      setError(null);
      setRows(((data ?? []) as unknown as Record<string, unknown>[]).map(mapAdminOrder));
    }
    setLoading(false);
  }

  useEffect(() => {
    void incarca();
    const channel = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void incarca();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const q = cautare.trim().toLowerCase();
  const vizibile = rows.filter((o) => {
    if (status !== "toate" && o.status !== status) return false;
    if (dela && o.createdAt < dela) return false;
    if (panaLa && o.createdAt > panaLa) return false;
    if (q) {
      const hay = `${o.number} ${o.customerName} ${o.customerEmail} ${o.customerPhone}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const detaliu = rows.find((o) => o.id === selected) ?? null;

  useEffect(() => {
    if (detaliu) {
      setNote(detaliu.adminNotes);
      setAwb(detaliu.awb ?? "");
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  async function schimbaStatus(o: ComandaAdmin, value: OrderStatus) {
    try {
      await setOrderStatus(o.id, value);
      toast.success(`Comanda ${o.number}: ${ORDER_STATUS_LABELS[value]}`);
      await incarca();
    } catch (err) {
      toast.error(mesajEroare(err, "Statusul nu a putut fi salvat."));
    }
  }

  async function salveazaDetalii(o: ComandaAdmin) {
    try {
      await updateOrderFields(o.id, { admin_notes: note, awb: awb || null });
      toast.success("Detaliile comenzii au fost salvate.");
      await incarca();
    } catch (err) {
      toast.error(mesajEroare(err, "Nu am putut salva detaliile."));
    }
  }

  return (
    <AdminShell title="Comenzi" description="Urmărește și actualizează statusul comenzilor.">
      {error && <p className="mb-4 rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      {loading && <p className="mb-4 text-sm text-muted-foreground">Se încarcă comenzile…</p>}

      <div className="mb-4">
        <button type="button" className="btn-dark" onClick={() => setFormularWa((v) => !v)}>
          + Comandă WhatsApp
        </button>
      </div>
      {formularWa && (
        <FormularComandaWhatsApp
          onClose={() => setFormularWa(false)}
          onSaved={() => void incarca()}
        />
      )}


      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="sr-only" htmlFor="cautare">Caută comandă</label>
          <input
            id="cautare"
            className="field"
            placeholder="Număr comandă, client sau telefon"
            value={cautare}
            onChange={(e) => setCautare(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="dela">De la</label>
          <input id="dela" type="date" className="field" value={dela} onChange={(e) => setDela(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="panala">Până la</label>
          <input id="panala" type="date" className="field" value={panaLa} onChange={(e) => setPanaLa(e.target.value)} />
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["toate", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              status === s ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
            }`}
          >
            {s === "toate" ? "Toate" : ORDER_STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <AdminTable
        head={["Comandă", "Client", "Dată", "Sursă", "Produse", "Total", "Plată", "Status", "Acțiuni"]}
        caption="Lista comenzilor"
      >
        {vizibile.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-3 font-semibold">{o.number}</td>
            <td className="px-4 py-3">
              <p>{o.customerName}</p>
              <p className="text-xs text-muted-foreground">{o.customerEmail}</p>
              <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
            </td>
            <td className="px-4 py-3 text-muted-foreground">{formatDate(o.createdAt)}</td>
            <td className="px-4 py-3 text-xs">{ORDER_SOURCE_LABELS[o.orderSource] ?? "Online"}</td>
            <td className="px-4 py-3">{o.items.length}</td>
            <td className="px-4 py-3">{formatPrice(o.total)}</td>
            <td className="px-4 py-3 text-xs text-muted-foreground">
              {o.paymentMethod === "card" ? "Card online" : "Ramburs"} · {PAYMENT_STATUS_LABELS[o.paymentStatus] ?? o.paymentStatus}
            </td>
            <td className="px-4 py-3">
              <label className="sr-only" htmlFor={`status-${o.id}`}>
                Status pentru comanda {o.number}
              </label>
              <select
                id={`status-${o.id}`}
                className="field py-2"
                value={o.status}
                onChange={(e) => void schimbaStatus(o, e.target.value as OrderStatus)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                className="btn-soft"
                onClick={() => setSelected(selected === o.id ? null : o.id)}
              >
                Detalii
              </button>
            </td>
          </tr>
        ))}
      </AdminTable>

      {detaliu && (
        <AdminCard className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Comanda {detaliu.number}</h2>
            <Pill tone={detaliu.status === "anulata" ? "danger" : "mint"}>
              {ORDER_STATUS_LABELS[detaliu.status]}
            </Pill>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div className="text-sm">
              <h3 className="font-semibold">Date client</h3>
              <p className="mt-1 text-muted-foreground">
                {detaliu.customerName}
                <br />
                {detaliu.customerEmail}
                <br />
                {detaliu.customerPhone}
              </p>
              <h3 className="mt-4 font-semibold">Adresă de livrare</h3>
              <p className="mt-1 text-muted-foreground">
                {detaliu.shippingAddress ? formatShippingAddress(detaliu.shippingAddress) : "—"}
                <br />
                {detaliu.city}, județul {detaliu.county}
              </p>
              <h3 className="mt-4 font-semibold">Plată</h3>
              <p className="mt-1 text-muted-foreground">
                Metodă: {detaliu.paymentMethod === "card" ? "Card online (Stripe)" : "Ramburs"}
                <br />
                Status: {PAYMENT_STATUS_LABELS[detaliu.paymentStatus] ?? detaliu.paymentStatus}
                {detaliu.paidAt ? (
                  <>
                    <br />
                    Plătită la: {formatDate(detaliu.paidAt)}
                  </>
                ) : null}
                {detaliu.stripeSessionId ? (
                  <>
                    <br />
                    <span className="break-all text-xs">Sesiune Stripe: {detaliu.stripeSessionId}</span>
                  </>
                ) : null}
                {detaliu.stripePaymentIntentId ? (
                  <>
                    <br />
                    <span className="break-all text-xs">Intenție de plată: {detaliu.stripePaymentIntentId}</span>
                  </>
                ) : null}
              </p>

              {detaliu.customerNotes && (
                <>
                  <h3 className="mt-4 font-semibold">Observațiile clientului</h3>
                  <p className="mt-1 text-muted-foreground">{detaliu.customerNotes}</p>
                </>
              )}

              <div className="mt-4 space-y-3">
                <div>
                  <label htmlFor="awb" className="text-sm font-semibold">AWB</label>
                  <input id="awb" className="field mt-1.5" value={awb} onChange={(e) => setAwb(e.target.value)} />
                </div>
                <div>
                  <label htmlFor="note-admin" className="text-sm font-semibold">Note interne</label>
                  <textarea
                    id="note-admin"
                    rows={3}
                    className="field mt-1.5"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
                <button type="button" className="btn-dark" onClick={() => void salveazaDetalii(detaliu)}>
                  Salvează detaliile
                </button>
              </div>
            </div>
            <div className="text-sm">
              <h3 className="font-semibold">Produse</h3>
              <ul className="mt-2 space-y-2">
                {detaliu.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4">
                    <span>
                      {it.name}
                      {it.variantLabel ? ` — ${it.variantLabel}` : ""} × {it.quantity}
                      <span className="block text-xs text-muted-foreground">
                        {it.sku} · {formatPrice(it.unitPrice)}/buc
                      </span>
                    </span>
                    <span>{formatPrice(it.total)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-1 border-t border-border pt-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatPrice(detaliu.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reducere</dt>
                  <dd>-{formatPrice(detaliu.discount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Transport</dt>
                  <dd>{detaliu.shipping === 0 ? "Gratuit" : formatPrice(detaliu.shipping)}</dd>
                </div>
                <div className="flex justify-between font-display text-base font-semibold">
                  <dt>Total</dt>
                  <dd>{formatPrice(detaliu.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </AdminCard>
      )}
    </AdminShell>
  );
}
