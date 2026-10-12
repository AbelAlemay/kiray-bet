import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { PaymentWarning } from "@/components/PaymentWarning";
import { SearchBar } from "@/components/SearchBar";
import { getLatestListings } from "@/lib/listings";
import { site } from "@/lib/site";

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
    text: "Listings show the neighborhood and an approximate map area. The host chooses who sees the address.",
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

export default async function Home() {
  const latest = await getLatestListings(6);

  return (
    <>
      <section className="bg-gradient-to-br from-brand-strong via-brand to-emerald-600 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pt-20">
          <div className="mb-3 flex flex-wrap gap-2 text-sm">
            <p className="rounded-full bg-white/15 px-3 py-1">Denver · Aurora · Lakewood · Englewood</p>
            <a href="#safety" className="rounded-full bg-white/15 px-3 py-1 transition hover:bg-white/25">
              🔒 Safe & private · ደህንነቱ የተጠበቀ
            </a>
          </div>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            {site.taglineAm}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{site.tagline}.</p>
          <div className="mt-8 max-w-4xl">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Latest homes</h2>
            <p className="text-muted">አዳዲስ ቤቶች</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-brand hover:underline">
            See all →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

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
            className="rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
          >
            Post for free
          </Link>
        </div>
      </section>
    </>
  );
}
