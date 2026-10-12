import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Post a home",
  robots: { index: false },
};

// The posting form arrives in build phase 4; for now this only requires sign-in.
async function NewListing() {
  const user = await requireUser("/listings/new");
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <p className="font-semibold">Thanks, {user.name ?? "friend"}! Posting opens soon.</p>
      <p className="mt-1 text-sm text-muted">
        The form for posting a home is being built. Every listing will be checked by a person
        before it appears.
      </p>
    </div>
  );
}

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10">
      <h1 className="mb-6 text-2xl font-bold">Post a home · ቤት ያስተዋውቁ</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <NewListing />
      </Suspense>
    </div>
  );
}
