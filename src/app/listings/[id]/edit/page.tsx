import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingForm, type ListingFormValues } from "@/components/listing-form/ListingForm";
import { requireUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { updateListing } from "../../actions";

export const metadata: Metadata = {
  title: "Edit listing",
  robots: { index: false },
};

type Props = PageProps<"/listings/[id]/edit">;

async function EditListing({ params }: { params: Props["params"] }) {
  const { id } = await params;
  const user = await requireUser(`/listings/${id}/edit`);

  // The host's own client: returns nothing unless this host owns the listing.
  const supabase = await createServerSupabase();
  const [{ data: listing }, { data: address }, { data: photos }] = await Promise.all([
    supabase.from("listings").select("*").eq("id", id).eq("host_id", user.id).maybeSingle(),
    supabase.from("listing_addresses").select("street_address, unit, zip").eq("listing_id", id).maybeSingle(),
    supabase.from("listing_photos").select("path").eq("listing_id", id).order("order"),
  ]);
  if (!listing) notFound();

  const paths = (photos ?? []).map((p) => p.path);
  const { data: signed } = paths.length
    ? await supabase.storage.from("listing-photos").createSignedUrls(paths, 3600)
    : { data: [] };

  const initial: ListingFormValues = {
    title: listing.title,
    description: listing.description,
    type: listing.type,
    price: listing.price,
    deposit: listing.deposit,
    bedrooms: listing.bedrooms,
    bathrooms: Number(listing.bathrooms),
    city: listing.city,
    state: listing.state,
    availableFrom: listing.available_from,
    amenities: listing.amenities ?? [],
    addressVisibility: listing.show_exact_address ? "public" : "private",
    parking: listing.parking,
    petsAllowed: listing.pets_allowed,
    street: address?.street_address ?? "",
    unit: address?.unit ?? "",
    zip: address?.zip ?? "",
  };
  const initialPhotos = (signed ?? []).flatMap((s) =>
    s.path && s.signedUrl ? [{ path: s.path, preview: s.signedUrl, saved: true }] : [],
  );
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });

  return (
    <ListingForm
      userId={user.id}
      listingId={id}
      today={today}
      initial={initial}
      initialPhotos={initialPhotos}
      saveAction={updateListing}
    />
  );
}

export default function EditListingPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-8">
      <Link href="/listings/mine" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← My listings
      </Link>
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Edit listing · ማስተካከያ</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-border/50" />}>
        <EditListing params={params} />
      </Suspense>
    </div>
  );
}
