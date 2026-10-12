import Link from "next/link";
import type { Listing } from "@/lib/sample-listings";
import { formatDate, formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

const typeColors: Record<Listing["type"], string> = {
  house: "from-emerald-700 to-emerald-500",
  apartment: "from-sky-700 to-sky-500",
  basement: "from-amber-700 to-amber-500",
  room: "from-rose-700 to-rose-500",
};

export function ListingCard({ listing }: { listing: Listing }) {
  const type = site.listingTypes.find((t) => t.value === listing.type)!;

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Photo placeholder until uploads exist (build step 4) */}
      <div className={`relative h-40 bg-gradient-to-br ${typeColors[listing.type]}`}>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900">
          {type.label} · {type.labelAm}
        </span>
        <span className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-2.5 py-1 text-sm font-bold text-white">
          {formatPrice(listing.price)}/mo
        </span>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="font-semibold group-hover:text-brand">{listing.title}</h3>
        <p className="text-sm text-muted">
          {listing.neighborhood}, {listing.city}
        </p>
        <p className="text-sm">
          {listing.bedrooms} bd · {listing.bathrooms} ba
          {listing.utilitiesIncluded && " · Utilities incl."}
          {listing.parking && " · Parking"}
        </p>
        <p className="text-xs text-muted">Available {formatDate(listing.availableFrom)}</p>
      </div>
    </Link>
  );
}
