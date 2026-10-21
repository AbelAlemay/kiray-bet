"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { geocodeAddress, type GeocodeResult } from "@/lib/geocode";
import { regionFor, regions } from "@/lib/regions";
import { listingAlert, notifyAdmin } from "@/lib/notify";
import { parseListingForm, type AddressInput, type ListingErrors } from "@/lib/listing-rules";
import { createServerSupabase } from "@/lib/supabase/server";
import { passedBotCheck } from "@/lib/turnstile";
import { site } from "@/lib/site";
import type { T } from "@/lib/i18n";
import { getActionT } from "@/lib/i18n-server";

// All listing changes run as the signed-in host, so the database's rules apply:
// hosts only touch their own listings, and edits send a listing back to review.

export type ListingFormState = { errors?: ListingErrors };

const bucket = "listing-photos";
const saveFailed = (t: T) => t("We couldn't save your listing. Please try again.", "ማስታወቂያዎን ማስቀመጥ አልቻልንም። እባክዎ እንደገና ይሞክሩ።");
const signInExpired = (t: T) => t("Your sign-in expired. Please sign in again.", "የመግቢያ ጊዜዎ አልፏል። እባክዎ እንደገና ይግቡ።");

async function locate(address: AddressInput, city: string, state: string, t: T) {
  const point = await geocodeAddress(address.street_address, city, state, address.zip);
  if (!point) {
    return {
      error: t(
        "We couldn't find this address. Check the street, city, state and ZIP code.",
        "ይህን አድራሻ ማግኘት አልቻልንም። መንገዱን፣ ከተማውን፣ ስቴቱንና ዚፕ ኮዱን ያረጋግጡ።",
      ),
    };
  }
  if (!regionFor(point.lat, point.lng)) {
    return {
      error: t(
        `KirayBet isn't in that area yet. For now we list homes in: ${regions.map((r) => r.name).join(", ")}.`,
        `${site.name} እስካሁን በዚያ አካባቢ የለም። ለአሁን ቤቶችን የምናስተዋውቀው በእነዚህ አካባቢዎች ነው፦ ${regions.map((r) => r.nameAm).join("፣ ")}።`,
      ),
    };
  }
  return { point };
}

// Saves a new listing as "pending". It goes live only after the admin approves it.
export async function createListing(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await getCurrentUser();
  const t = await getActionT();
  if (!user) return { errors: { form: signInExpired(t) } };

  const parsed = parseListingForm(formData, user.id, t);
  if ("errors" in parsed) return { errors: parsed.errors };
  const { listing, address, photos } = parsed;

  if (!(await passedBotCheck(formData))) {
    return { errors: { form: t("We couldn't confirm you're not a bot. Please try again.", "ሮቦት አለመሆንዎን ማረጋገጥ አልቻልንም። እባክዎ እንደገና ይሞክሩ።") } };
  }

  const located = await locate(address, listing.city, listing.state, t);
  if ("error" in located) return { errors: { street: located.error } };
  if (located.point.city) listing.city = located.point.city;

  const supabase = await createServerSupabase();
  const { error: listingError } = await supabase.from("listings").insert({ ...listing, host_id: user.id });
  if (listingError) {
    const limited = listingError.message.includes("Too many new listings");
    const tooMany = t(
      "You've posted several listings today. Please wait until tomorrow to post more.",
      "ዛሬ ብዙ ማስታወቂያዎችን ለጥፈዋል። ተጨማሪ ለመለጠፍ እባክዎ እስከ ነገ ይጠብቁ።",
    );
    return { errors: { form: limited ? (t.lang === "am" ? tooMany : listingError.message) : saveFailed(t) } };
  }

  const [addressResult, photosResult] = await Promise.all([
    supabase.from("listing_addresses").insert({
      listing_id: listing.id,
      ...address,
      exact_lat: located.point.lat,
      exact_lng: located.point.lng,
      location_precision: located.point.precision,
    }),
    supabase
      .from("listing_photos")
      .insert(photos.map((path, order) => ({ listing_id: listing.id, path, order }))),
  ]);
  if (addressResult.error || photosResult.error) {
    await supabase.from("listings").delete().eq("id", listing.id);
    return { errors: { form: saveFailed(t) } };
  }

  after(() => notifyAdmin(listingAlert("new", listing, user.name)));
  redirect("/listings/mine?posted=1");
}

// Saves changes. Anything beyond the availability date goes back to review (the
// database decides that), and the page says so.
export async function updateListing(_prev: ListingFormState, formData: FormData): Promise<ListingFormState> {
  const user = await getCurrentUser();
  const t = await getActionT();
  if (!user) return { errors: { form: signInExpired(t) } };

  const parsed = parseListingForm(formData, user.id, t);
  if ("errors" in parsed) return { errors: parsed.errors };
  const { listing, address, photos } = parsed;
  const { id, ...fields } = listing;

  const supabase = await createServerSupabase();
  const [{ data: current }, { data: currentAddress }, { data: currentPhotos }] = await Promise.all([
    supabase.from("listings").select("host_id, status, city, state").eq("id", id).maybeSingle(),
    supabase.from("listing_addresses").select("street_address, unit, zip").eq("listing_id", id).maybeSingle(),
    supabase.from("listing_photos").select("path").eq("listing_id", id).order("order"),
  ]);
  if (!current || current.host_id !== user.id) {
    return { errors: { form: t("This listing can't be edited.", "ይህን ማስታወቂያ ማስተካከል አይቻልም።") } };
  }

  // Look the address up again only if it changed.
  const addressChanged =
    !currentAddress ||
    currentAddress.street_address !== address.street_address ||
    currentAddress.unit !== address.unit ||
    currentAddress.zip !== address.zip ||
    current.city.toLowerCase() !== listing.city.toLowerCase() ||
    current.state !== listing.state;
  let point: GeocodeResult | undefined;
  if (addressChanged) {
    const located = await locate(address, listing.city, listing.state, t);
    if ("error" in located) return { errors: { street: located.error } };
    point = located.point;
    if (point.city) fields.city = point.city;
  }

  const { error: listingError } = await supabase.from("listings").update(fields).eq("id", id);
  if (listingError) return { errors: { form: saveFailed(t) } };

  if (point) {
    const { error } = await supabase
      .from("listing_addresses")
      .upsert({ listing_id: id, ...address, exact_lat: point.lat, exact_lng: point.lng, location_precision: point.precision });
    if (error) return { errors: { form: saveFailed(t) } };
  }

  // Photos: replace the list only if the photos or their order changed.
  const before = (currentPhotos ?? []).map((p) => p.path);
  if (before.join() !== photos.join()) {
    const { error: deleteError } = await supabase.from("listing_photos").delete().eq("listing_id", id);
    const { error: insertError } = deleteError
      ? { error: deleteError }
      : await supabase.from("listing_photos").insert(photos.map((path, order) => ({ listing_id: id, path, order })));
    if (insertError) return { errors: { form: saveFailed(t) } };
    const removed = before.filter((p) => !photos.includes(p));
    if (removed.length) await supabase.storage.from(bucket).remove(removed);
  }

  const { data: saved } = await supabase.from("listings").select("status").eq("id", id).single();
  const sentToReview = saved?.status === "pending" && current.status !== "pending";
  if (sentToReview) after(() => notifyAdmin(listingAlert("edited", listing, user.name)));
  updateTag("listings");
  redirect(`/listings/mine?updated=${sentToReview ? "review" : "1"}`);
}

export async function deleteListing(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("listingId") ?? "");
  if (!user || !id) return;

  const supabase = await createServerSupabase();
  const { data: photos } = await supabase.from("listing_photos").select("path").eq("listing_id", id);
  const { data: deleted } = await supabase.from("listings").delete().eq("id", id).eq("host_id", user.id).select("id");
  if (deleted?.length && photos?.length) {
    await supabase.storage.from(bucket).remove(photos.map((p) => p.path));
  }
  updateTag("listings");
  redirect("/listings/mine?deleted=1");
}

// Rented listings drop out of search; hosts can switch them back without a new review.
export async function setRented(formData: FormData) {
  const user = await getCurrentUser();
  const id = String(formData.get("listingId") ?? "");
  const rented = formData.get("rented") === "true";
  if (!user || !id) return;

  const supabase = await createServerSupabase();
  await supabase
    .from("listings")
    .update({ status: rented ? "rented" : "active" })
    .eq("id", id)
    .eq("host_id", user.id)
    .eq("status", rented ? "active" : "rented");
  updateTag("listings");
  redirect("/listings/mine");
}
