import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-12">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="pt-8">
      {eyebrow && (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-[60ch] text-sm text-muted-foreground text-pretty">{description}</p>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-10 text-center">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-[45ch] text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
