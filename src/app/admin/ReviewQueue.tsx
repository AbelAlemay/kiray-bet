import { fieldClass, primaryButtonClass } from "@/components/form-styles";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import { createServerSupabase } from "@/lib/supabase/server";
import { approveListing, rejectListing } from "./actions";
import { signPhotos, sortedPhotos } from "./data";

type PendingRow = {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  neighborhood: string;
  available_from: string;
  utilities_included: boolean;
  parking: boolean;
  pets_allowed: boolean;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  host: { display_name: string | null; private_profiles: { email: string } | null } | null;
  listing_addresses: { street_address: string; unit: string | null; zip: string } | null;
  listing_photos: { path: string; order: number }[];
};

// Listings waiting for review, oldest first, with everything needed to decide.
export async function ReviewQueue() {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, description, type, price, deposit, bedrooms, bathrooms, city, neighborhood, available_from, " +
        "utilities_included, parking, pets_allowed, reviewed_at, created_at, updated_at, " +
        "host:profiles!listings_host_id_fkey(display_name, private_profiles(email)), " +
        "listing_addresses(street_address, unit, zip), listing_photos(path, order)",
    )
    .eq("status", "pending")
    .order("updated_at", { ascending: true })
    .overrideTypes<PendingRow[], { merge: false }>();
  const pending = data ?? [];
  const photoUrl = await signPhotos(supabase, pending.flatMap((l) => l.listing_photos.map((p) => p.path)));

  return (
    <div className="space-y-6">
      <p className="text-muted">
        {pending.length === 0 ? "Nothing waiting for review. 🎉" : `${pending.length} waiting for review, oldest first.`}
      </p>
      {pending.map((l) => {
        const type = site.listingTypes.find((t) => t.value === l.type);
        const address = l.listing_addresses;
        const fullAddress = address && `${address.street_address}${address.unit ? `, ${address.unit}` : ""}, ${l.city}, CO ${address.zip}`;
        const photos = sortedPhotos(l.listing_photos);
        return (
          <article key={l.id} id={l.id} className="scroll-mt-24 space-y-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-brand">
                  {l.reviewed_at ? "EDITED, re-review" : "NEW"} · {type?.label} · {formatDate(l.updated_at.slice(0, 10))}
                </p>
                <h2 className="text-xl font-bold">{l.title}</h2>
                <p className="text-sm text-muted">
                  {l.neighborhood}, {l.city} · {formatPrice(l.price)}/mo · deposit {formatPrice(l.deposit)} ·{" "}
                  {l.bedrooms} bd / {l.bathrooms} ba · from {formatDate(l.available_from)}
                </p>
              </div>
              <p className="text-right text-sm">
                {l.host?.display_name ?? "—"}
                <br />
                <span className="text-muted">{l.host?.private_profiles?.email}</span>
              </p>
            </div>

            {photos.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {photos.map((p) => {
                  const src = photoUrl.get(p.path);
                  return src ? (
                    <a key={p.path} href={src} target="_blank" rel="noreferrer" className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed link */}
                      <img src={src} alt="" className="h-32 w-44 rounded-lg object-cover" />
                    </a>
                  ) : null;
                })}
              </div>
            )}

            <p className="whitespace-pre-line text-sm">{l.description}</p>
            <p className="text-sm text-muted">
              {[l.utilities_included && "Utilities incl.", l.parking && "Parking", l.pets_allowed && "Pets OK"]
                .filter(Boolean)
                .join(" · ") || "No extras"}
            </p>

            {fullAddress && (
              <p className="rounded-xl bg-brand-soft p-3 text-sm">
                🔒 {fullAddress} ·{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand hover:underline"
                >
                  Check on map / Street View
                </a>
              </p>
            )}

            <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
              <form action={approveListing}>
                <input type="hidden" name="listingId" value={l.id} />
                <input type="hidden" name="tab" value="review" />
                <button className={primaryButtonClass}>✓ Approve</button>
              </form>
              <form action={rejectListing} className="flex gap-2">
                <input type="hidden" name="listingId" value={l.id} />
                <input type="hidden" name="tab" value="review" />
                <input
                  name="note"
                  required
                  maxLength={500}
                  placeholder="Reason, shown to the host (e.g. photos too dark)"
                  className={fieldClass}
                />
                <button className="shrink-0 rounded-xl border border-danger/50 px-4 font-semibold text-danger hover:bg-danger/10">
                  Reject
                </button>
              </form>
            </div>
          </article>
        );
      })}
    </div>
  );
}
