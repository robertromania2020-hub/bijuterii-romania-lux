/**
 * Stratul de date pentru clienți: sesiune, profil, adrese, comenzi și
 * plasarea comenzii prin funcția securizată din baza de date.
 */
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { OrderStatus } from "@/data/types";

export interface Profile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CustomerAddress {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  county: string;
  city: string;
  street: string;
  streetNumber: string;
  building: string;
  entrance: string;
  floor: string;
  apartment: string;
  postalCode: string;
  additionalInformation: string;
  isDefault: boolean;
}

export interface CustomerOrderItem {
  id: string;
  name: string;
  sku: string;
  variantLabel: string | null;
  image: string | null;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
}

export interface CustomerOrder {
  id: string;
  number: string;
  status: OrderStatus;
  createdAt: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  awb: string | null;
  items: CustomerOrderItem[];
}

/** Mesaj prietenos în română; nu expune erori brute din baza de date. */
export function mesajEroare(err: unknown, implicit = "Nu am putut finaliza operațiunea. Te rugăm să încerci din nou."): string {
  const raw = err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const obj = err as { message?: string; hint?: string } | null;
  const hint = obj && typeof obj === "object" ? obj.hint : undefined;
  const message = obj?.message ?? raw;
  if (hint === "APP" && message) return message;
  // Mesajele noastre sunt deja în română și se termină cu punct.
  if (/^[A-ZĂÂÎȘȚ].*[.!]$/.test(message) && !/[{}]|permission denied|violates|duplicate key/i.test(message)) {
    return message;
  }
  return implicit;
}

/* ------------------------------ sesiune ------------------------------ */

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, loading };
}

/* ------------------------------- profil ------------------------------ */

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error(mesajEroare(error, "Nu am putut încărca datele contului."));
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    createdAt: data.created_at,
  };
}

export async function saveProfile(
  userId: string,
  fields: { firstName: string; lastName: string; phone: string; email: string },
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: fields.firstName,
      last_name: fields.lastName,
      phone: fields.phone,
      email: fields.email,
    })
    .eq("user_id", userId);
  if (error) throw new Error(mesajEroare(error, "Nu am putut salva datele."));
}

/* ------------------------------- adrese ------------------------------ */

type AddressRow = {
  id: string;
  label: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  county: string | null;
  city: string | null;
  street: string | null;
  street_number: string | null;
  building: string | null;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  postal_code: string | null;
  additional_information: string | null;
  is_default: boolean | null;
};

function mapAddress(r: AddressRow): CustomerAddress {
  return {
    id: r.id,
    label: r.label ?? "Acasă",
    firstName: r.first_name ?? "",
    lastName: r.last_name ?? "",
    phone: r.phone ?? "",
    county: r.county ?? "",
    city: r.city ?? "",
    street: r.street ?? "",
    streetNumber: r.street_number ?? "",
    building: r.building ?? "",
    entrance: r.entrance ?? "",
    floor: r.floor ?? "",
    apartment: r.apartment ?? "",
    postalCode: r.postal_code ?? "",
    additionalInformation: r.additional_information ?? "",
    isDefault: Boolean(r.is_default),
  };
}

export async function fetchAddresses(userId: string): Promise<CustomerAddress[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) throw new Error(mesajEroare(error, "Nu am putut încărca adresele."));
  return ((data ?? []) as unknown as AddressRow[]).map(mapAddress);
}

export async function saveAddress(userId: string, a: Omit<CustomerAddress, "id"> & { id?: string }) {
  const row = {
    ...(a.id ? { id: a.id } : {}),
    user_id: userId,
    label: a.label,
    recipient: `${a.lastName} ${a.firstName}`.trim(),
    first_name: a.firstName,
    last_name: a.lastName,
    phone: a.phone,
    county: a.county,
    city: a.city,
    street: a.street,
    street_number: a.streetNumber,
    building: a.building,
    entrance: a.entrance,
    floor: a.floor,
    apartment: a.apartment,
    postal_code: a.postalCode,
    additional_information: a.additionalInformation,
    is_default: a.isDefault,
  };
  const { error } = await supabase.from("addresses").upsert(row as never);
  if (error) throw new Error(mesajEroare(error, "Nu am putut salva adresa."));
  if (a.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId)
      .neq("id", a.id ?? "00000000-0000-0000-0000-000000000000");
  }
}

export async function deleteAddress(id: string) {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw new Error(mesajEroare(error, "Nu am putut șterge adresa."));
}

/* ------------------------------ comenzi ------------------------------ */

export const ORDER_SELECT = "*, order_items(*)";

type OrderItemRow = {
  id: string;
  product_name_snapshot: string;
  sku_snapshot: string | null;
  variant_name_snapshot: string | null;
  product_image_snapshot: string | null;
  unit_price: number | string;
  quantity: number;
  discount_amount: number | string;
  total: number | string;
};

export function mapCustomerOrder(row: Record<string, unknown>): CustomerOrder {
  const items = (Array.isArray(row["order_items"]) ? (row["order_items"] as OrderItemRow[]) : []).map(
    (i) => ({
      id: i.id,
      name: i.product_name_snapshot,
      sku: i.sku_snapshot ?? "",
      variantLabel: i.variant_name_snapshot,
      image: i.product_image_snapshot,
      unitPrice: Number(i.unit_price),
      quantity: i.quantity,
      discount: Number(i.discount_amount),
      total: Number(i.total),
    }),
  );
  return {
    id: String(row["id"] ?? ""),
    number: String(row["number"] ?? ""),
    status: (row["status"] as OrderStatus) ?? "noua",
    createdAt: String(row["created_at"] ?? ""),
    subtotal: Number(row["subtotal"] ?? 0),
    discount: Number(row["discount"] ?? 0),
    shipping: Number(row["shipping"] ?? 0),
    total: Number(row["total"] ?? 0),
    paymentMethod: String(row["payment_method"] ?? "ramburs"),
    paymentStatus: String(row["payment_status"] ?? "neplatita"),
    awb: (row["awb"] as string | null) ?? null,
    items,
  };
}

export async function fetchMyOrders(userId: string): Promise<CustomerOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(mesajEroare(error, "Nu am putut încărca comenzile."));
  return ((data ?? []) as unknown as Record<string, unknown>[]).map(mapCustomerOrder);
}

/* -------------------------- plasarea comenzii ------------------------ */

export interface PlaceOrderInput {
  items: Array<{ product_id: string; variant_id: string | null; quantity: number }>;
  customer: { first_name: string; last_name: string; email: string; phone: string };
  shipping: Record<string, string>;
  customerNotes?: string;
}

export async function placeOrder(input: PlaceOrderInput) {
  const { data, error } = await supabase.rpc("place_order", {
    p_items: input.items as never,
    p_customer: input.customer as never,
    p_shipping: input.shipping as never,
    p_payment_method: "ramburs",
    p_customer_notes: input.customerNotes ?? "",

  });
  if (error) throw new Error(mesajEroare(error));
  return data as unknown as { order_id: string; number: string; total: number };
}
