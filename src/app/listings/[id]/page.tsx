import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingsMap } from "@/components/ListingsMap";
import { ViewSwitch } from "@/components/ViewSwitch";
import { PaymentWarning } from "@/components/PaymentWarning";
import { SaveButton } from "@/components/SaveButton";
import { formatDate, formatPrice, nearLabel } from "@/lib/format";
import { getListing } from "@/lib/listings";
import { amenityLabels, site } from "@/lib/site";
import { LinkPending } from "@/components/Pending";

type Props = PageProps<"/listings/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.title} · ${formatPrice(listing.price)}/mo`,
    description: `${nearLabel(listing)}. ${listing.description}`,
  };
}

function Fact({ label, labelAm, value }: { label: string; labelAm: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <dt className="text-xs text-muted">
        {label} · {labelAm}
      </dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

// Cover photo large, the rest as a grid. Placeholder when a listing has no photos.
function PhotoGallery({ photos, title }: { photos: string[]; title: string }) {
  if (photos.length === 0) {
    return (
      <div className="grid h-72 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-96">
        <div className="col-span-4 row-span-2 bg-gradient-to-br from-brand-strong to-brand sm:col-span-3" />
        <div className="hidden bg-brand/70 sm:block" />
        <div className="hidden bg-brand/50 sm:block" />
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:grid-cols-4">
      {photos.map((src, i) => (
        <div key={src} className={`relative bg-border/50 ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-[4/3]"}`}>
          <Image
            src={src}
            alt={i === 0 ? title : `${title}, photo ${i + 1}`}
            fill
            priority={i === 0}
            sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 640px) 25vw, 50vw"}
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

async function ListingDetail({ params }: { params: Props["params"] }) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();

  const type = site.listingTypes.find((t) => t.value === listing.type)!;
  const yesNo = (v: boolean) => (v ? "Yes" : "No");
  // Signs visitors in first (requireUser), then opens the conversation page.
  const contactHref = `/messages/new?listing=${listing.id}`;

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {listing.approxLat != null && listing.approxLng != null ? (
            <ViewSwitch
              label="Show"
              options={["📷 Photos", "🗺 Map"]}
              views={[
                <PhotoGallery key="photos" photos={listing.photos} title={listing.title} />,
                <div key="map" className="space-y-2">
                  <ListingsMap
                    pins={[
                      {
                        id: listing.id,
                        title: listing.title,
                        price: listing.price,
                        type: listing.type,
                        neighborhood: listing.neighborhood,
                        city: listing.city,
                        crossStreets: listing.crossStreets,
                        lat: listing.approxLat,
                        lng: listing.approxLng,
                      },
                    ]}
                    interactive={false}
                    zoom={13}
                    className="h-72 sm:h-96"
                  />
                  <p className="text-sm text-muted">
                    🔒 Approximate area: {nearLabel(listing)}. The host shares the exact address
                    with you after you message them.
                  </p>
                </div>,
              ]}
            />
          ) : (
            <PhotoGallery photos={listing.photos} title={listing.title} />
          )}

          <div>
            <p className="text-sm font-semibold text-brand">
              {type.label} · {type.labelAm}
            </p>
            <h1 className="mt-1 break-words text-3xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-muted">
              {nearLabel(listing)}, {listing.state}
            </p>
            {listing.exactAddress ? (
              <p className="mt-2 text-sm">
                📍 <strong>{listing.exactAddress}, {listing.city}, {listing.state}</strong>{" "}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${listing.exactAddress}, ${listing.city}, ${listing.state}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-brand hover:underline"
                >
                  Open in Maps
                </a>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                🔒 The exact address is private. The host shares it with you after you message them.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Bedrooms" labelAm="መኝታ ክፍል" value={listing.bedrooms === 0 ? "Studio" : String(listing.bedrooms)} />
            <Fact label="Bathrooms" labelAm="መታጠቢያ" value={String(listing.bathrooms)} />
            <Fact label="Deposit" labelAm="ቅድመ ክፍያ" value={formatPrice(listing.deposit)} />
            <Fact
              label="Available"
              labelAm="የሚገኝበት"
              value={formatDate(listing.availableFrom, { month: "short", day: "numeric", year: "numeric" })}
            />
            <Fact label="Parking" labelAm="መኪና ማቆሚያ" value={yesNo(listing.parking)} />
            <Fact label="Pets allowed" labelAm="የቤት እንስሳ" value={yesNo(listing.petsAllowed)} />
          </dl>

          {listing.amenities.length > 0 && (
            <section>
              <h2 className="mb-2 text-xl font-bold">
                Amenities · <span className="text-muted">ምን ምን አለው?</span>
              </h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {amenityLabels(listing.amenities).map((label) => (
                  <li key={label} className="flex items-center gap-2">
                    <span aria-hidden className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-soft text-sm text-brand">
                      ✓
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-2 text-xl font-bold">About this home</h2>
            <p className="whitespace-pre-line break-words leading-relaxed">{listing.description}</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p>
              <span className="text-3xl font-bold">{formatPrice(listing.price)}</span>
              <span className="text-muted"> /month</span>
            </p>
            <p className="text-sm text-muted">
              Hosted by <span className="font-semibold text-foreground">{listing.hostName}</span> · posted{" "}
              {formatDate(listing.postedAt)}
            </p>
            <Link
              href={contactHref}
              className="relative block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white hover:bg-brand-strong"
            >
              <LinkPending />
              Contact host · ባለቤቱን ያግኙ
            </Link>
            <SaveButton listingId={listing.id} variant="button" />
            {/* "Report this listing" link arrives with moderation in build step 9. */}
            <ul className="space-y-1 text-xs text-muted">
              <li>✉ No account needed in advance: just confirm your email to send a message.</li>
              <li>🔒 No phone numbers needed. You chat privately inside {site.nameLatin}.</li>
              <li>✓ This listing was reviewed before it went live.</li>
            </ul>
            <PaymentWarning compact />
          </div>
        </aside>
      </div>

      {/* Phones: price and contact always in reach at the bottom of the screen. */}
      <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="leading-tight">
            <span className="text-xl font-bold">{formatPrice(listing.price)}</span>
            <span className="text-sm text-muted"> /month</span>
            <span className="block text-xs text-muted">
              {nearLabel(listing)}
            </span>
          </p>
          <Link
            href={contactHref}
            className="relative whitespace-nowrap rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-strong"
          >
            <LinkPending />
            Contact host
          </Link>
        </div>
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="h-72 animate-pulse rounded-2xl bg-border/50 sm:h-96" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-border/50" />
        <div className="h-24 animate-pulse rounded-xl bg-border/50" />
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-border/50" />
    </div>
  );
}

export default function ListingPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Link href="/search" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← Back to search
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ListingDetail params={params} />
      </Suspense>
    </div>
  );
}
