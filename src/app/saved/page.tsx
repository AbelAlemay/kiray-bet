import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { SaveButton } from "@/components/SaveButton";
import { requireUser } from "@/lib/auth";
import { getListingsByIds } from "@/lib/listings";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved homes",
  robots: { index: false },
};

async function Saved() {
  const user = await requireUser("/saved");
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);
  const ids = (data ?? []).map((f) => f.listing_id);
  const listings = await getListingsByIds(ids);
  const gone = ids.filter((id) => !listings.some((l) => l.id === id));

  if (ids.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center">
        <p className="font-semibold">No saved homes yet.</p>
        <p className="mt-1 text-sm text-muted">Tap ♡ on any home to keep it here for later.</p>
        <Link href="/search" className="mt-4 inline-block font-semibold text-brand hover:underline">
          Browse homes →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {listings.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
      {gone.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold text-muted">No longer available</h2>
          <ul className="space-y-2">
            {gone.map((id) => (
              <li key={id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 text-sm">
                <span className="text-muted">This home was rented or removed by the host.</span>
                <span className="w-32 shrink-0">
                  <SaveButton listingId={id} variant="button" />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Saved homes · የተቀመጡ ቤቶች</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <Saved />
      </Suspense>
    </div>
  );
}
