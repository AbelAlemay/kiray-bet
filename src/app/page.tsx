import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { SearchBar } from "@/components/SearchBar";
import { sampleListings } from "@/lib/sample-listings";
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

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-br from-brand-strong via-brand to-emerald-600 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 sm:pt-20">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-sm">
            Denver · Aurora · Lakewood · Englewood
          </p>
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
          {sampleListings.map((listing) => (
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
