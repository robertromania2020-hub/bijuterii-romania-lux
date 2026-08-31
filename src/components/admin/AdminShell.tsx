import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  BadgePercent,
  Boxes,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Package,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Tag,
  Ticket,
  Users,
  X,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Prezentare generală", icon: LayoutDashboard, exact: true },
  { to: "/admin/produse", label: "Produse", icon: Package },
  { to: "/admin/departamente", label: "Departamente", icon: LayoutGrid },
  { to: "/admin/categorii", label: "Categorii", icon: FolderTree },
  { to: "/admin/branduri", label: "Branduri", icon: Tag },
  { to: "/admin/atribute", label: "Atribute", icon: SlidersHorizontal },
  { to: "/admin/colectii", label: "Colecții", icon: Sparkles },
  { to: "/admin/stoc", label: "Stoc", icon: Boxes },
  { to: "/admin/comenzi", label: "Comenzi", icon: ClipboardList },
  { to: "/admin/clienti", label: "Clienți", icon: Users },
  { to: "/admin/reduceri", label: "Reduceri", icon: BadgePercent },
  { to: "/admin/coduri-promotionale", label: "Coduri promoționale", icon: Ticket },
  { to: "/admin/setari", label: "Setări", icon: Settings },
] as const;

export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-surface lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-4 py-4">
          <Link to="/admin" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-foreground font-display text-sm font-semibold text-background">
              B
            </span>
            <span className="font-display font-semibold tracking-tight">Administrare</span>
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full lg:hidden"
            aria-label={open ? "Închide meniul" : "Deschide meniul"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        <nav
          className={`px-3 pb-4 ${open ? "block" : "hidden"} lg:block`}
          aria-label="Navigare administrare"
        >
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: "exact" in item ? item.exact : false }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                  activeProps={{ className: "bg-foreground text-background hover:bg-foreground" }}
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/"
            className="mt-4 block rounded-2xl border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted"
          >
            Înapoi la magazin
          </Link>
        </nav>
      </aside>

      <div className="px-4 py-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions}
        </header>
        <p className="mt-4 rounded-2xl bg-peach p-3 text-xs">
          Zonă protejată — autentificarea și autorizarea administratorilor vor fi implementate în
          etapa următoare. Modificările nu sunt încă salvate.
        </p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function AdminCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-3xl border border-border bg-surface p-5 ${className}`}>{children}</div>
  );
}

export function AdminTable({
  head,
  children,
  caption,
}: {
  head: string[];
  children: ReactNode;
  caption: string;
}) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

export function Pill({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "mint" | "peach" | "lilac" | "danger";
}) {
  const tones = {
    muted: "bg-muted text-muted-foreground",
    mint: "bg-mint text-foreground",
    peach: "bg-peach text-foreground",
    lilac: "bg-lilac text-foreground",
    danger: "bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
