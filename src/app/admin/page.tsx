import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { ActivityStats } from "./ActivityStats";
import { AdminSearch } from "./AdminSearch";
import { isoDaysAgo, searchTerm } from "./data";
import { LeasesTab } from "./LeasesTab";
import { ListingsTab, type ListingTab } from "./ListingsTab";
import { ReviewQueue } from "./ReviewQueue";
import { TwoStepForm } from "./TwoStepForm";
import { UsersTab } from "./UsersTab";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const tabs = [
  { id: "review", label: "To review" },
  { id: "live", label: "Live" },
  { id: "rented", label: "Rented" },
  { id: "rejected", label: "Not approved" },
  { id: "users", label: "Users" },
  { id: "leases", label: "Leases" },
] as const;
type Tab = (typeof tabs)[number]["id"];

const doneMessages: Record<string, string> = {
  approved: "Approved. It's live now.",
  rejected: "Done. The listing is down and the host can see your note.",
  deleted: "Listing deleted.",
  banned: "User banned and their listings taken down.",
  unbanned: "User unbanned.",
  self: "You can't ban your own account.",
  "note-missing": "Please write a short note so the host knows what to fix.",
  intersection: "Found the nearest intersection.",
  "intersection-failed": "Couldn't find an intersection right now (the map service may be busy). Try again later.",
};

async function Admin({ searchParams }: { searchParams: PageProps<"/admin">["searchParams"] }) {
  const user = await requireUser("/admin");
  if (user.role !== "admin") notFound();

  const supabase = await createServerSupabase();

  if (!user.twoStepVerified) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const factor = factors?.totp[0];
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="mb-4 text-xl font-bold">🔐 Two-step login</h2>
        <TwoStepForm initial={factor ? { step: "verify", factorId: factor.id } : { step: "start" }} />
      </div>
    );
  }

  const params = await searchParams;
  const tab: Tab = tabs.find((t) => t.id === params.tab)?.id ?? "review";
  const done = typeof params.done === "string" ? doneMessages[params.done] : undefined;
  const q = searchTerm(params.q);

  // Counts for the tab labels and the summary.
  const count = (status: string) =>
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("status", status);
  const weekAgo = isoDaysAgo(7);
  const [pending, active, rented, rejected, users, newUsers] = await Promise.all([
    count("pending"),
    count("active"),
    count("rented"),
    count("rejected"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);
  const counts: Record<Tab, number> = {
    review: pending.count ?? 0,
    live: active.count ?? 0,
    rented: rented.count ?? 0,
    rejected: rejected.count ?? 0,
    users: users.count ?? 0,
    leases: 4,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Right now</h2>
      <dl className="-mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "To review", value: counts.review, highlight: counts.review > 0 },
          { label: "Live listings", value: counts.live },
          { label: "Rented", value: counts.rented },
          { label: "Users", value: counts.users, extra: `+${newUsers.count ?? 0} this week` },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.highlight ? "border-accent bg-accent/10" : "border-border bg-surface"}`}>
            <dt className="text-xs text-muted">{s.label}</dt>
            <dd className="text-2xl font-bold">{s.value}</dd>
            {s.extra && <dd className="text-xs text-muted">{s.extra}</dd>}
          </div>
        ))}
      </dl>

      <ActivityStats />

      <nav className="flex gap-1 overflow-x-auto border-b border-border text-sm">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            aria-current={t.id === tab ? "page" : undefined}
            className={`whitespace-nowrap border-b-2 px-3 py-2 font-semibold ${
              t.id === tab ? "border-brand text-brand" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label} <span className="font-normal">({counts[t.id]})</span>
          </Link>
        ))}
      </nav>

      {done && (
        <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          {done}
        </p>
      )}

      {tab !== "leases" && (
        <AdminSearch
          tab={tab}
          q={q}
          placeholder={tab === "users" ? "Search name or email" : "Search title, area, city, or host name/email"}
        />
      )}

      {tab === "review" && <ReviewQueue q={q} />}
      {(tab === "live" || tab === "rented" || tab === "rejected") && <ListingsTab tab={tab as ListingTab} q={q} />}
      {tab === "users" && <UsersTab adminId={user.id} q={q} />}
      {tab === "leases" && <LeasesTab />}
    </div>
  );
}

export default function AdminPage({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <h1 className="mb-6 text-3xl font-bold">Admin</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-border/50" />}>
        <Admin searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
