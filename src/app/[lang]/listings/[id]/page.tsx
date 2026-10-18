import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListingsMap } from "@/components/ListingsMap";
import { ViewSwitch } from "@/components/ViewSwitch";
import { PaymentWarning } from "@/components/PaymentWarning";
import { PhotoGallery } from "@/components/PhotoGallery";
import { ReportButton } from "@/components/ReportButton";
import { SaveButton } from "@/components/SaveButton";
import { formatDate, formatPrice, nearLabel } from "@/lib/format";
import { getListing } from "@/lib/listings";
import { amenityLabels, site } from "@/lib/site";
import { LinkPending } from "@/components/Pending";
import { getT } from "@/lib/i18n-server";

type Props = PageProps<"/[lang]/listings/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  const t = await getT();
  if (!listing) return { title: t("Listing not found", "ማስታወቂያው አልተገኘም") };
  return {
    title: `${listing.title} · ${formatPrice(listing.price)}${t("/mo", "/በወር")}`,
    description: `${nearLabel(listing, t.lang)}. ${listing.description}`,
    ...(listing.sample && { robots: { index: false } }),
  };
}

async function Fact({ label, labelAm, value }: { label: string; labelAm: string; value: string }) {
  const t = await getT();
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <dt className="text-xs text-muted">
        {t.both(label, labelAm)}
      </dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

async function ListingDetail({ params }: { params: Props["params"] }) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();
  const t = await getT();

  const type = site.listingTypes.find((x) => x.value === listing.type)!;
  const yesNo = (v: boolean) => (v ? t("Yes", "አዎ") : t("No", "የለም"));
  const near = nearLabel(listing, t.lang);
  const perMonth = t(" /month", " /በወር");
  // Signs visitors in first (requireUser), then opens the conversation page.
  const contactHref = `/messages/new?listing=${listing.id}`;

  return (
    <>
      {listing.sample && (
        <div role="note" className="mb-5 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-gray-900 dark:bg-amber-950/40 dark:text-amber-50">
          <p className="font-bold">🏷 {t.both("Sample listing", "ናሙና ማስታወቂያ")}</p>
          <p className="mt-1 text-sm">
            {t(
              `This home isn't real. It's here to show what listings look like on ${site.nameLatin}, so there's no host to contact.`,
              `ይህ እውነተኛ ቤት አይደለም። ማስታወቂያዎች በ${site.name} ላይ ምን እንደሚመስሉ ለማሳየት ብቻ ነው፤ ስለዚህ የሚገናኙት ባለቤት የለም።`,
            )}{" "}
            <Link href="/listings/new" className="font-semibold text-brand hover:underline">
              {t("Post a real home →", "እውነተኛ ቤት ይለጥፉ →")}
            </Link>
          </p>
        </div>
      )}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {listing.approxLat != null && listing.approxLng != null ? (
            <ViewSwitch
              label={t("Show", "አሳይ")}
              options={[`📷 ${t("Photos", "ፎቶዎች")}`, `🗺 ${t("Map", "ካርታ")}`]}
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
                    🔒{" "}
                    {t(
                      `Approximate area: ${near}. The host shares the exact address with you after you message them.`,
                      `ግምታዊ ቦታ፦ ${near}። ባለቤቱን መልዕክት ከላኩ በኋላ ትክክለኛውን አድራሻ ያጋራዎታል።`,
                    )}
                  </p>
                </div>,
              ]}
            />
          ) : (
            <PhotoGallery photos={listing.photos} title={listing.title} />
          )}

          <div>
            <p className="text-sm font-semibold text-brand">
              {t.both(type.label, type.labelAm)}
            </p>
            <h1 className="mt-1 break-words text-3xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-muted">
              {near}, {listing.state}
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
                  {t("Open in Maps", "በካርታ ይክፈቱ")}
                </a>
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted">
                🔒{" "}
                {t(
                  "The exact address is private. The host shares it with you after you message them.",
                  "ትክክለኛው አድራሻ የግል ነው። ባለቤቱን መልዕክት ከላኩ በኋላ ያጋራዎታል።",
                )}
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Bedrooms" labelAm="መኝታ ክፍል" value={listing.bedrooms === 0 ? t("Studio", "ስቱዲዮ") : String(listing.bedrooms)} />
            <Fact label="Bathrooms" labelAm="መታጠቢያ" value={String(listing.bathrooms)} />
            <Fact label="Deposit" labelAm="ቅድመ ክፍያ" value={formatPrice(listing.deposit)} />
            <Fact
              label="Available"
              labelAm="የሚገኝበት"
              value={formatDate(listing.availableFrom, { month: "short", day: "numeric", year: "numeric" }, t.lang)}
            />
            <Fact label="Parking" labelAm="መኪና ማቆሚያ" value={yesNo(listing.parking)} />
            <Fact label="Pets allowed" labelAm="የቤት እንስሳ" value={yesNo(listing.petsAllowed)} />
          </dl>

          {listing.amenities.length > 0 && (
            <section>
              <h2 className="mb-2 text-xl font-bold">
                {t.both("Amenities", "ምን ምን አለው?")}
              </h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {amenityLabels(listing.amenities, t.lang).map((label) => (
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
            <h2 className="mb-2 text-xl font-bold">{t("About this home", "ስለ ቤቱ")}</h2>
            <p className="whitespace-pre-line break-words leading-relaxed">{listing.description}</p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-sm">
            <p>
              <span className="text-3xl font-bold">{formatPrice(listing.price)}</span>
              <span className="text-muted">{perMonth}</span>
            </p>
            {listing.sample ? (
              <>
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-semibold text-gray-900 dark:bg-amber-950/40 dark:text-amber-50">
                  🏷 {t("Sample listing: no host to contact", "ናሙና ማስታወቂያ፦ የሚገናኙት ባለቤት የለም")}
                </p>
                <SaveButton listingId={listing.id} variant="button" />
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  {t("Hosted by", "ባለቤት፦")} <span className="font-semibold text-foreground">{listing.hostName}</span> ·{" "}
                  {t("posted", "የተለጠፈው")} {formatDate(listing.postedAt, undefined, t.lang)}
                </p>
                <Link
                  href={contactHref}
                  className="relative block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white hover:bg-brand-strong"
                >
                  <LinkPending />
                  {t.both("Contact host", "ባለቤቱን ያግኙ")}
                </Link>
                <SaveButton listingId={listing.id} variant="button" />
                <ul className="space-y-1 text-xs text-muted">
                  <li>
                    ✉{" "}
                    {t(
                      "No account needed in advance: just confirm your email to send a message.",
                      "አስቀድሞ መለያ አያስፈልግም፦ መልዕክት ለመላክ ኢሜይልዎን ብቻ ያረጋግጡ።",
                    )}
                  </li>
                  <li>
                    🔒{" "}
                    {t(
                      `No phone numbers needed. You chat privately inside ${site.nameLatin}.`,
                      `ስልክ ቁጥር አያስፈልግም። በ${site.name} ውስጥ በግል ይነጋገራሉ።`,
                    )}
                  </li>
                  <li>✓ {t("This listing was reviewed before it went live.", "ይህ ማስታወቂያ ከመውጣቱ በፊት ተገምግሟል።")}</li>
                </ul>
                <PaymentWarning compact />
                <ReportButton targetType="listing" targetId={listing.id} label={t("Report this listing", "ይህን ማስታወቂያ ሪፖርት ያድርጉ")} />
              </>
            )}
          </div>
        </aside>
      </div>

      {/* Phones: price and contact always in reach at the bottom of the screen. */}
      <div data-bottom-bar className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <p className="min-w-0 leading-tight">
            <span className="text-xl font-bold">{formatPrice(listing.price)}</span>
            <span className="text-sm text-muted">{perMonth}</span>
            <span className="block truncate text-xs text-muted">
              {near}
            </span>
          </p>
          {listing.sample ? (
            <span className="shrink-0 whitespace-nowrap rounded-xl bg-amber-300 px-4 py-3 font-semibold text-gray-900">
              🏷 {t("Sample listing", "ናሙና")}
            </span>
          ) : (
            <Link
              href={contactHref}
              className="relative shrink-0 whitespace-nowrap rounded-xl bg-brand px-4 py-3 font-semibold text-white hover:bg-brand-strong sm:px-5"
            >
              <LinkPending />
              {t("Contact host", "ባለቤቱን ያግኙ")}
            </Link>
          )}
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

export default async function ListingPage({ params }: Props) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Link href="/search" className="mb-2 inline-block py-2 text-sm text-muted hover:text-foreground">
        ← {t("Back to search", "ወደ ፍለጋ ይመለሱ")}
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ListingDetail params={params} />
      </Suspense>
    </div>
  );
}
