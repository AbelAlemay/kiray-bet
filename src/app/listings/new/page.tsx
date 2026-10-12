import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { ListingForm } from "@/components/listing-form/ListingForm";
import { createListing } from "../actions";

export const metadata: Metadata = {
  title: "Post a home",
  robots: { index: false },
};

async function NewListing() {
  const user = await requireUser("/listings/new");
  // Chosen up front so photos can upload into this listing's folder before it's saved.
  const listingId = crypto.randomUUID();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" }); // YYYY-MM-DD
  return <ListingForm userId={user.id} listingId={listingId} today={today} saveAction={createListing} />;
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Post a home · ቤት ያስተዋውቁ</h1>
      <p className="mb-6 mt-1 text-muted">Free to post. Reviewed by a person before it goes live.</p>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/50" />}>
        <NewListing />
      </Suspense>
    </div>
  );
}
