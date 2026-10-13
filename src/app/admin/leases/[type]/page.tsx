import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatMessageTime } from "@/lib/format";
import { leaseTitles } from "@/lib/leases/fields";
import { getLeaseTemplate, getLeaseVersions } from "@/lib/leases/templates-server";
import { site } from "@/lib/site";
import { LeaseEditor } from "./LeaseEditor";

export const metadata: Metadata = {
  title: "Edit lease agreement",
  robots: { index: false },
};

type Props = PageProps<"/admin/leases/[type]">;

async function Editor({ params, searchParams }: { params: Props["params"]; searchParams: Props["searchParams"] }) {
  const user = await requireUser("/admin");
  if (user.role !== "admin") notFound();
  if (!user.twoStepVerified) {
    return (
      <p className="rounded-2xl border border-border bg-surface p-5">
        Please <Link href="/admin" className="font-semibold text-brand hover:underline">confirm your two-step login</Link> first.
      </p>
    );
  }
  const { type: raw } = await params;
  const type = site.listingTypes.find((t) => t.value === raw)?.value;
  if (!type) notFound();
  const { saved } = await searchParams;
  const [template, versions] = await Promise.all([getLeaseTemplate(type), getLeaseVersions(type)]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{leaseTitles[type]}</h1>
        <p className="mt-1 text-sm text-muted">
          {template.version === 0
            ? "Showing KirayBet's built-in draft (not reviewed by a lawyer)."
            : `Showing version ${template.version}${template.lawyerReviewed ? ` · ✓ ${template.reviewNote ?? "Reviewed by a lawyer"}` : " · not marked as reviewed by a lawyer"}.`}{" "}
          Paste or edit the attorney&apos;s text below and save. Hosts get the newest version.
        </p>
      </div>
      {saved && (
        <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          Saved as version {template.version}. New leases use it from now on.
        </p>
      )}
      <LeaseEditor
        key={template.version}
        type={type}
        body={template.body}
        reviewed={template.lawyerReviewed}
        note={template.reviewNote ?? ""}
      />
      {versions.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface p-4 text-sm">
          <h2 className="mb-2 font-semibold">Version history</h2>
          <ul className="space-y-1">
            {versions.map((v) => (
              <li key={v.version}>
                Version {v.version} · {formatMessageTime(v.created_at)} ·{" "}
                {v.lawyer_reviewed ? `✓ ${v.review_note ?? "lawyer reviewed"}` : "draft"}
              </li>
            ))}
            <li className="text-muted">Version 0 · KirayBet built-in draft</li>
          </ul>
        </section>
      )}
    </div>
  );
}

export default function LeaseEditorPage({ params, searchParams }: Props) {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-6">
      <Link href="/admin?tab=leases" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← Admin · Leases
      </Link>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/50" />}>
        <Editor params={params} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
