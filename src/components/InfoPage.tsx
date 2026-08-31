import { PageHeading, SiteLayout } from "./SiteLayout";

export interface InfoSection {
  title: string;
  body: string;
}

export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow?: string | undefined;
  title: string;
  intro: string;
  sections: InfoSection[];
}) {
  return (
    <SiteLayout>
      <PageHeading eyebrow={eyebrow} title={title} description={intro} />
      <div className="mt-6 max-w-[70ch] space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-3xl border border-border bg-surface p-5">
            <h2 className="font-display text-lg font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </SiteLayout>
  );
}
