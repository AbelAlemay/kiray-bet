import Link from "next/link";
import { Suspense } from "react";
import { ListingCard } from "@/components/ListingCard";
import { PaymentWarning } from "@/components/PaymentWarning";
import { SearchBar } from "@/components/SearchBar";
import { ListingsMap } from "@/components/ListingsMap";
import { ViewSwitch } from "@/components/ViewSwitch";
import { getCityCounts, getLatestListings, getListingPins } from "@/lib/listings";
import { getChosenRegion } from "@/lib/region-server";
import { site } from "@/lib/site";
import { LinkPending } from "@/components/Pending";

const steps = [
  {
    title: "Search",
    titleAm: "ይፈልጉ",
    text: "Filter by city, price and type: a whole house, apartment, basement or a single room.",
  },
  {
    title: "Message the host",
    titleAm: "ባለቤቱን ያግኙ",
    text: "Chat directly in English or Amharic. No middleman, no fees for renters.",
  },
  {
    title: "Move in",
    titleAm: "ይግቡ",
    text: "Visit the home, agree on terms with the host, and move in.",
  },
];

// Keep these concrete and true; never promise that data "can't be stolen".
const promises = [
  {
    title: "We never ask for your phone number",
    text: "Hosts and renters talk through messages inside the site, and your email is never shown to anyone.",
  },
  {
    title: "Exact address only with the host's approval",
    text: "Listings show the nearest major intersection and an approximate map area. The host chooses who sees the address.",
  },
  {
    title: "Every listing is checked by a person",
    text: "New listings are reviewed before they appear, so fake and copied listings don't go live.",
  },
  {
    title: "Report anything suspicious",
    text: "One tap reports a listing or a message. Scammers are removed and banned.",
  },
];

// Everything that depends on the chosen area: headline, cities, latest homes.
async function AreaSections() {
  const region = await getChosenRegion();
  const [latest, cityCounts, pins] = await Promise.all([
    getLatestListings(6, region.id),
    getCityCounts(region.id),
    getListingPins({ region: region.id, sort: "newest", page: 1 }),
  ]);
  const citiesWithHomes = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]);
  const searchHref = (extra = "") => `/search?region=${region.id}${extra}`;

  return (
    <>
      <section className="bg-forest bg-[url(/house-pattern.svg)] bg-[length:80px] text-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pt-20">
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <p className="rounded-full bg-white/15 px-3 py-1">{region.cities.slice(0, 4).join(" · ")}</p>
            <a href="#safety" className="rounded-full bg-white/15 px-3 py-1 transition hover:bg-white/25">
              🔒 Safe & private · ደህንነቱ የተጠበቀ
            </a>
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-door [text-shadow:0_3px_0_rgb(0_0_0/0.45),0_4px_16px_rgb(0_0_0/0.75)] sm:text-5xl">
            {region.headlineAm}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{region.taglineEn}.</p>
          <div className="mt-8 max-w-4xl">
            <SearchBar region={region.id} cities={[...new Set([...citiesWithHomes.map(([c]) => c), ...region.cities])]} />
          </div>
        </div>
      </section>

      {citiesWithHomes.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-10">
          <h2 className="mb-3 text-lg font-bold">
            Homes by city · <span className="text-muted">በከተማ</span>
          </h2>
          {/* Scrolls sideways on phones; wraps on wider screens. */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
            {citiesWithHomes.map(([city, count]) => (
              <Link
                key={city}
                href={searchHref(`&city=${encodeURIComponent(city)}`)}
                className="relative flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-4 font-semibold hover:border-brand"
              >
                <LinkPending />
                {city}
                <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs text-brand">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="mb-3">
          <h2 className="text-2xl font-bold">Latest homes · {region.name}</h2>
          <p className="text-muted">አዳዲስ ቤቶች</p>
        </div>
        {latest.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No homes listed in {region.name} yet.</p>
            <p className="mt-1 text-sm text-muted">Have a room or home to rent here? Be the first to post it, for free.</p>
            <Link
              href="/listings/new"
              className="relative mt-4 inline-block rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-strong"
            >
              <LinkPending />
              Post a home
            </Link>
          </div>
        ) : (
          <ViewSwitch
            label="Show homes as"
            options={["☰ List", "🗺 Map"]}
            actions={
              <Link href={searchHref()} className="relative py-2 text-sm font-semibold text-brand hover:underline">
                <LinkPending />
                See all →
              </Link>
            }
            views={[
              <div key="list" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {latest.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>,
              <div key="map" className="space-y-2">
                <ListingsMap pins={pins} center={region.center} zoom={region.zoom} className="h-80 sm:h-[28rem]" />
                <p className="text-xs text-muted">
                  🔒 Approximate areas only. Exact addresses are shared by the host.{" "}
                  <Link href={searchHref("&view=map")} className="font-semibold text-brand hover:underline">
                    Open full map with filters →
                  </Link>
                </p>
              </div>,
            ]}
          />
        )}
      </section>
    </>
  );
}

function AreaSkeleton() {
  return (
    <>
      <section className="bg-forest text-white">
        <div className="mx-auto h-[26rem] max-w-6xl px-4 pt-20">
          <div className="h-12 w-2/3 animate-pulse rounded bg-white/15" />
          <div className="mt-8 h-14 max-w-4xl animate-pulse rounded-2xl bg-white/10" />
        </div>
      </section>
      <div className="mx-auto mt-10 grid max-w-6xl gap-5 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-border/50" />
        ))}
      </div>
    </>
  );
}

export default function Home() {
  return (
    <>
      <Suspense fallback={<AreaSkeleton />}>
        <AreaSections />
      </Suspense>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="mb-6 text-2xl font-bold">How it works</h2>
        <ol className="grid gap-5 sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-2xl border border-border bg-surface p-5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-accent font-bold text-gray-900">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">
                {step.title} · <span className="text-muted">{step.titleAm}</span>
              </h3>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="safety" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16">
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <p className="text-sm font-semibold text-brand">🔒 Safe & private · ደህንነቱ የተጠበቀ</p>
          <h2 className="mt-1 text-2xl font-bold">Your information stays private</h2>
          <p className="mt-1 max-w-2xl text-muted">
            Rental scams are common in online groups. {site.nameLatin} is built so hosts and renters
            can connect without giving their personal details to strangers.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {promises.map((p) => (
              <li key={p.title} className="flex gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  ✓
                </span>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <PaymentWarning />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-brand-soft p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-2xl font-bold">Have a room or house to rent?</h2>
            <p className="text-muted">ቤት ወይም ክፍል አለዎት? በነጻ ያስተዋውቁ።</p>
          </div>
          <Link
            href="/listings/new"
            className="relative rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
          >
            <LinkPending />
            Post for free
          </Link>
        </div>
      </section>
    </>
  );
}
