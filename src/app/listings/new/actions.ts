"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { geocodeAddress, inDenverMetro } from "@/lib/geocode";
import { parseListingForm, type ListingErrors } from "@/lib/listing-rules";
import { createServerSupabase } from "@/lib/supabase/server";

export type PostState = { errors?: ListingErrors };

// Saves a new listing as "pending". It goes live only after the admin approves it.
export async function createListing(_prev: PostState, formData: FormData): Promise<PostState> {
  const user = await getCurrentUser();
  if (!user) return { errors: { form: "Your sign-in expired. Please sign in again." } };

  const parsed = parseListingForm(formData, user.id);
  if ("errors" in parsed) return { errors: parsed.errors };
  const { listing, address, photos } = parsed;

  const point = await geocodeAddress(address.street_address, listing.city, address.zip);
  if (!point) {
    return {
      errors: { street: "We couldn't find this address. Check the street, city and ZIP code." },
    };
  }
  if (!inDenverMetro(point)) {
    return { errors: { street: "For now we only list homes in the Denver metro area." } };
  }

  // Runs as the signed-in user, so the database's rules apply: the listing is created
  // as pending, and photos must sit in this host's folder.
  const supabase = await createServerSupabase();
  const { error: listingError } = await supabase.from("listings").insert({ ...listing, host_id: user.id });
  if (listingError) {
    const limited = listingError.message.includes("Too many new listings");
    return {
      errors: {
        form: limited ? listingError.message : "We couldn't save your listing. Please try again.",
      },
    };
  }

  const [addressResult, photosResult] = await Promise.all([
    supabase.from("listing_addresses").insert({
      listing_id: listing.id,
      ...address,
      exact_lat: point.lat,
      exact_lng: point.lng,
    }),
    supabase
      .from("listing_photos")
      .insert(photos.map((path, order) => ({ listing_id: listing.id, path, order }))),
  ]);
  if (addressResult.error || photosResult.error) {
    await supabase.from("listings").delete().eq("id", listing.id);
    return { errors: { form: "We couldn't save your listing. Please try again." } };
  }

  // TODO(phase 4): notify the admin by email and Telegram.
  redirect("/listings/mine?posted=1");
}
