import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatPrice, placeLabel } from "@/lib/format";
import { leaseStates } from "@/lib/regions";
import { createServerSupabase } from "@/lib/supabase/server";
import { ListingActions } from "./ListingActions";
import { LinkPending } from "@/components/Pending";

export const metadata: Metadata = {
  title: "My listings",
  robots: { index: false },
};

const statusLabels = {
  pending: { label: "Waiting for review · በግምገማ ላይ", className: "bg-accent/20 text-foreground" },
  active: { label: "Live · ታትሟል", className: "bg-brand-soft text-brand" },
  rejected: { label: "Not approved", className: "bg-danger/10 text-danger" },
  rented: { label: "Rented · ተከራይቷል", className: "bg-border text-muted" },
} as const;

type Row = {
  id: string;
  title: string;
  status: keyof typeof statusLabels;
  price: number;
  city: string;
  neighborhood: string | null;
  cross_streets: string | null;
  state: string;
  review_note: string | null;
  listing_photos: { path: string; order: number }[];
};

async function MyListings({ searchParams }: { searchParams: PageProps<"/[lang]/listings/mine">["searchParams"] }) {
  const user = await requireUser("/listings/mine");
  const { posted, updated, deleted } = await searchParams;
  const notice =
    updated === "review"
      ? "Saved. Your changes are waiting for a quick review; the listing is hidden until they're approved."
      : updated
        ? "Saved. · ተቀምጧል"
        : deleted
          ? "Listing deleted."
          : null;

  // The host's own client: the database returns only this host's listings (any status).
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("listings")
    .select("id, title, status, price, city, state, neighborhood, cross_streets, review_note, listing_photos(path, order)")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })
    .overrideTypes<Row[], { merge: false }>();
  const listings = data ?? [];

  // Short-lived links to each cover photo (the bucket is private).
  const covers = listings
    .map((l) => [...l.listing_photos].sort((a, b) => a.order - b.order)[0]?.path)
    .filter((p): p is string => !!p);
  const { data: signed } = covers.length
    ? await supabase.storage.from("listing-photos").createSignedUrls(covers, 3600)
    : { data: [] };
  const coverUrl = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <div className="space-y-4">
      {posted && (
        <div role="status" className="rounded-2xl bg-brand-soft p-5">
          <p className="font-semibold">Thanks! Your listing was sent for review. · ለግምገማ ተልኳል</p>
          <p className="mt-1 text-sm">
            A person checks every listing before it appears, usually within a day. It will show
            as &ldquo;Live&rdquo; here once it&apos;s approved.
          </p>
        </div>
      )}
      {notice && (
        <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          {notice}
        </p>
      )}
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-semibold">You haven&apos;t posted any homes yet.</p>
          <Link href="/listings/new" className="mt-3 inline-block font-semibold text-brand hover:underline">
            Post a home →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const status = statusLabels[l.status];
            const cover = [...l.listing_photos].sort((a, b) => a.order - b.order)[0];
            const src = cover && coverUrl.get(cover.path);
            return (
              <li key={l.id} className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-3 sm:flex-nowrap">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
                  <img src={src} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-28 shrink-0 rounded-lg bg-border/50" />
                )}
                <div className="min-w-0 flex-1">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                  <p className="mt-1 truncate font-semibold">{l.title}</p>
                  <p className="text-sm text-muted">
                    {formatPrice(l.price)}/mo · {placeLabel({ ...l, crossStreets: l.cross_streets })}
                  </p>
                  {l.status === "rejected" && l.review_note && (
                    <p className="mt-1 text-sm text-danger">
                      Reviewer&apos;s note: {l.review_note}. Edit the listing to fix it and resubmit.
                    </p>
                  )}
                </div>
                <div className="self-center">
                  <ListingActions id={l.id} status={l.status} leaseAvailable={leaseStates.includes(l.state)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function MyListingsPage({ searchParams }: PageProps<"/[lang]/listings/mine">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">My listings · የእኔ ቤቶች</h1>
        <Link href="/listings/new" className="relative whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">
          <LinkPending />
          + Post a home
        </Link>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <MyListings searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
