import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaymentWarning } from "@/components/PaymentWarning";
import { formatDate, formatPrice } from "@/lib/format";
import { getListing } from "@/lib/listings";
import { site } from "@/lib/site";

type Props = PageProps<"/listings/[id]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing((await params).id);
  if (!listing) return { title: "Listing not found" };
  return {
    title: `${listing.title} · ${formatPrice(listing.price)}/mo`,
    description: `${listing.neighborhood}, ${listing.city}. ${listing.description}`,
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

async function ListingDetail({ params }: { params: Props["params"] }) {
  const listing = await getListing((await params).id);
  if (!listing) notFound();

  const type = site.listingTypes.find((t) => t.value === listing.type)!;
  const yesNo = (v: boolean) => (v ? "Yes" : "No");

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* Photo gallery placeholder until uploads exist (build step 4) */}
        <div className="grid h-72 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-96">
          <div className="col-span-4 row-span-2 bg-gradient-to-br from-brand-strong to-brand sm:col-span-3" />
          <div className="hidden bg-brand/70 sm:block" />
          <div className="hidden bg-brand/50 sm:block" />
        </div>

        <div>
          <p className="text-sm font-semibold text-brand">
            {type.label} · {type.labelAm}
          </p>
          <h1 className="mt-1 text-3xl font-bold">{listing.title}</h1>
          <p className="mt-1 text-muted">
            {listing.neighborhood}, {listing.city}, CO
          </p>
          <p className="mt-2 text-sm text-muted">
            🔒 The exact address is private. The host shares it with you after you message them.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Fact label="Bedrooms" labelAm="መኝታ ክፍል" value={String(listing.bedrooms)} />
          <Fact label="Bathrooms" labelAm="መታጠቢያ" value={String(listing.bathrooms)} />
          <Fact label="Deposit" labelAm="ቅድመ ክፍያ" value={formatPrice(listing.deposit)} />
          <Fact
            label="Available"
            labelAm="የሚገኝበት"
            value={formatDate(listing.availableFrom, { month: "short", day: "numeric", year: "numeric" })}
          />
          <Fact label="Utilities incl." labelAm="መብራት/ውሃ" value={yesNo(listing.utilitiesIncluded)} />
          <Fact label="Parking" labelAm="መኪና ማቆሚያ" value={yesNo(listing.parking)} />
          <Fact label="Pets allowed" labelAm="የቤት እንስሳ" value={yesNo(listing.petsAllowed)} />
        </dl>

        <section>
          <h2 className="mb-2 text-xl font-bold">About this home</h2>
          <p className="leading-relaxed">{listing.description}</p>
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
          {/* Messaging arrives in build step 7; until then contacting requires an account. */}
          <Link
            href={`/login?next=/listings/${listing.id}`}
            className="block rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white hover:bg-brand-strong"
          >
            Contact host · ባለቤቱን ያግኙ
          </Link>
          <Link
            href={`/login?next=/listings/${listing.id}`}
            className="block rounded-xl border border-border px-4 py-3 text-center font-semibold hover:bg-brand-soft"
          >
            ♡ Save
          </Link>
          {/* "Report this listing" link arrives with moderation in build step 9. */}
          <ul className="space-y-1 text-xs text-muted">
            <li>🔒 No phone numbers needed. You chat privately inside {site.nameLatin}.</li>
            <li>✓ This listing was reviewed before it went live.</li>
          </ul>
          <PaymentWarning compact />
        </div>
      </aside>
    </div>
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
      <Link href="/search" className="mb-4 inline-block text-sm text-muted hover:text-foreground">
        ← Back to search
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ListingDetail params={params} />
      </Suspense>
    </div>
  );
}
