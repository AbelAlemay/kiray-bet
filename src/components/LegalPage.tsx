import Link from "next/link";
import { Prose, type Section } from "./Prose";

// Terms and Privacy: the English text is the official one. Amharic readers get a short
// summary above it.
export function LegalPage({
  label,
  title,
  updated,
  amSummary,
  showAmSummary,
  sections,
}: {
  label: string;
  title: string;
  updated: string;
  amSummary: string[];
  showAmSummary: boolean;
  sections: Section[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">{label}</p>
      <h1 className="mt-1 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
      {showAmSummary && (
        <div lang="am" className="mt-6 rounded-2xl bg-brand-soft p-5 text-sm">
          <p className="font-semibold">በአጭሩ</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {amSummary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-muted">ሙሉው ጽሑፍ ከታች በእንግሊዝኛ ነው፤ ትክክለኛው ቅጂ የእንግሊዝኛው ነው። ጥያቄ ካለዎት <Link href="/contact" className="font-semibold text-brand hover:underline">ያግኙን</Link>።</p>
        </div>
      )}
      <div lang="en" className="mt-8">
        <Prose sections={sections} />
      </div>
    </div>
  );
}
