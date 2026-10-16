import type { ReactNode } from "react";

// Long-form text pages (Safety, Terms, Privacy): one section per heading.
export type Section = { title: string; paras?: ReactNode[]; bullets?: ReactNode[] };

export function Prose({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.title}>
          <h2 className="text-xl font-bold">{s.title}</h2>
          {s.paras?.map((p, i) => (
            <p key={i} className="mt-2 leading-relaxed text-foreground/90">
              {p}
            </p>
          ))}
          {s.bullets && (
            <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-foreground/90 marker:text-brand">
              {s.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
