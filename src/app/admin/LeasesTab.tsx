import Link from "next/link";
import { leaseTitles } from "@/lib/leases/fields";
import { getLeaseTemplate } from "@/lib/leases/templates-server";
import { site } from "@/lib/site";

// Admin overview of the four lease agreements and whether a lawyer has approved them.
export async function LeasesTab() {
  const templates = await Promise.all(site.listingTypes.map((t) => getLeaseTemplate(t.value)));
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        Hosts generate leases from these agreements (📄 Lease on My listings). Until an agreement is
        marked as reviewed by a Colorado attorney, every lease made from it shows a &ldquo;draft, not
        reviewed&rdquo; warning.
      </p>
      <ul className="space-y-3">
        {templates.map((t) => (
          <li key={t.type} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
            <div>
              <p className="font-semibold">{leaseTitles[t.type]}</p>
              <p className={`text-sm ${t.lawyerReviewed ? "text-brand" : "text-danger"}`}>
                {t.lawyerReviewed
                  ? `✓ Version ${t.version} · ${t.reviewNote ?? "reviewed by a lawyer"}`
                  : t.version === 0
                    ? "KirayBet draft · not reviewed by a lawyer"
                    : `Version ${t.version} · not marked as reviewed`}
              </p>
            </div>
            <Link href={`/admin/leases/${t.type}`} className="inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold hover:bg-brand-soft">
              Open / edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
