import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaymentWarning } from "@/components/PaymentWarning";
import { requireUser } from "@/lib/auth";
import { formatPrice } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Message the host",
  robots: { index: false },
};

type Props = PageProps<"/messages/new">;

// Where "Contact host" leads. Becomes the real conversation in build phase 6;
// until then it confirms the listing and says messaging is coming.
async function NewMessage({ searchParams }: { searchParams: Props["searchParams"] }) {
  const { listing: listingParam } = await searchParams;
  const id = typeof listingParam === "string" ? listingParam : "";
  const user = await requireUser(`/messages/new?listing=${encodeURIComponent(id)}`);

  const supabase = await createServerSupabase();
  const { data: listing } = /^[0-9a-f-]{36}$/i.test(id)
    ? await supabase
        .from("listings")
        .select("id, title, price, city, neighborhood, host_id, host:profiles!listings_host_id_fkey(display_name)")
        .eq("id", id)
        .eq("status", "active")
        .maybeSingle()
        .overrideTypes<
          { id: string; title: string; price: number; city: string; neighborhood: string; host_id: string; host: { display_name: string | null } | null },
          { merge: false }
        >()
    : { data: null };
  if (!listing) notFound();

  const summary = (
    <Link href={`/listings/${listing.id}`} className="block rounded-2xl border border-border bg-surface p-4 hover:border-brand">
      <p className="font-semibold">{listing.title}</p>
      <p className="text-sm text-muted">
        {formatPrice(listing.price)}/mo · {listing.neighborhood}, {listing.city}
      </p>
    </Link>
  );

  if (listing.host_id === user.id) {
    return (
      <div className="space-y-4">
        {summary}
        <div className="rounded-2xl bg-brand-soft p-5">
          <p className="font-semibold">This is your listing.</p>
          <p className="mt-1 text-sm">Renters&apos; messages about it will show up in Messages.</p>
          <Link href={`/listings/${listing.id}/edit`} className="mt-3 inline-block font-semibold text-brand hover:underline">
            Edit listing →
          </Link>
        </div>
      </div>
    );
  }

  const hostName = listing.host?.display_name ?? "the host";
  return (
    <div className="space-y-4">
      {summary}
      <div className="rounded-2xl border border-dashed border-border p-6 text-center">
        <p className="font-semibold">Messaging opens soon. · በቅርቡ</p>
        <p className="mt-1 text-sm text-muted">
          You&apos;ll be able to message {hostName} here privately, without sharing your phone number
          or email.
        </p>
      </div>
      <PaymentWarning compact />
    </div>
  );
}

export default function NewMessagePage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Message the host · ባለቤቱን ያግኙ</h1>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <NewMessage searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
