import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { createServerSupabase } from "@/lib/supabase/server";
import { approveListing, deleteListingAsAdmin, rejectListing } from "./actions";
import { ConfirmButton } from "./ConfirmButton";
import { signPhotos, sortedPhotos } from "./data";

export type ListingTab = "live" | "rented" | "rejected";
const statusFor = { live: "active", rented: "rented", rejected: "rejected" } as const;

type Row = {
  id: string;
  title: string;
  price: number;
  city: string;
  neighborhood: string;
  review_note: string | null;
  reviewed_at: string | null;
  updated_at: string;
  host: { display_name: string | null; private_profiles: { email: string } | null } | null;
  listing_photos: { path: string; order: number }[];
};

export async function ListingsTab({ tab }: { tab: ListingTab }) {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("listings")
    .select(
      "id, title, price, city, neighborhood, review_note, reviewed_at, updated_at, " +
        "host:profiles!listings_host_id_fkey(display_name, private_profiles(email)), listing_photos(path, order)",
    )
    .eq("status", statusFor[tab])
    .order("updated_at", { ascending: false })
    .limit(200)
    .overrideTypes<Row[], { merge: false }>();
  const rows = data ?? [];
  const covers = rows.map((r) => sortedPhotos(r.listing_photos)[0]?.path).filter((p): p is string => !!p);
  const coverUrl = await signPhotos(supabase, covers);

  if (rows.length === 0) return <p className="text-muted">No listings here.</p>;

  return (
    <ul className="space-y-3">
      {rows.map((l) => {
        const cover = sortedPhotos(l.listing_photos)[0];
        const src = cover && coverUrl.get(cover.path);
        const fields = { listingId: l.id, tab };
        return (
          <li key={l.id} className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-3">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
              <img src={src} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
            ) : (
              <div className="h-20 w-28 shrink-0 rounded-lg bg-border/50" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{l.title}</p>
              <p className="text-sm text-muted">
                {formatPrice(l.price)}/mo · {l.neighborhood}, {l.city}
              </p>
              <p className="text-xs text-muted">
                Host: {l.host?.display_name ?? "—"} · {l.host?.private_profiles?.email} · updated{" "}
                {formatDate(l.updated_at.slice(0, 10))}
              </p>
              {l.review_note && <p className="mt-1 text-sm text-danger">Note to host: {l.review_note}</p>}
            </div>
            <div className="flex w-full flex-wrap items-start gap-2 sm:w-auto sm:max-w-xs sm:justify-end">
              {tab === "live" && (
                <Link href={`/listings/${l.id}`} className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-brand-soft">
                  View
                </Link>
              )}
              {tab === "rejected" ? (
                <form action={approveListing}>
                  <input type="hidden" name="listingId" value={l.id} />
                  <input type="hidden" name="tab" value={tab} />
                  <button className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold hover:bg-brand-soft">
                    Approve
                  </button>
                </form>
              ) : (
                <ConfirmButton
                  label="Take down"
                  question="Take this listing down? The host sees your note and can fix and resubmit."
                  confirmLabel="Take down"
                  action={rejectListing}
                  fields={fields}
                  notePlaceholder="Reason, shown to the host"
                  noteRequired
                  danger
                />
              )}
              <ConfirmButton
                label="Delete"
                question="Delete this listing and its photos for good?"
                confirmLabel="Yes, delete"
                action={deleteListingAsAdmin}
                fields={fields}
                danger
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
