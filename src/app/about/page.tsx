import type { Metadata } from "next";
import Link from "next/link";
import { regions } from "@/lib/regions";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `${site.nameLatin}: homes for rent from our community, in ${regions.length} U.S. metro areas.`,
};

const points = [
  {
    title: "Made for our community",
    text: `Rooms, basements, apartments and houses in ${regions.length} U.S. metro areas: ${regions.map((r) => r.name).join(", ")}. In English and Amharic.`,
  },
  {
    title: "Safe and private",
    text: "We never ask for your phone number, your email is never shown to other users, and the exact address is shared only when the host agrees.",
  },
  {
    title: "Checked by a person",
    text: "Every listing is reviewed before it appears, so fake and copied listings don't go live.",
  },
  {
    title: "Free, and no money through the site",
    text: "Posting and searching are free. We never handle rent or deposits, and we warn renters never to pay before seeing the home and signing a lease.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-10">
      <p className="text-sm font-semibold text-brand">About · ስለ እኛ</p>
      <h1 className="mt-1 text-3xl font-bold">{site.taglineAm}</h1>
      <p className="mt-3 text-lg text-muted">
        {site.nameLatin} ({site.name}, &ldquo;house for rent&rdquo;) helps people in our community
        find a place to live and helps hosts find good renters, without passing personal details to
        strangers in group chats.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {points.map((p) => (
          <li key={p.title} className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted">{p.text}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-2xl bg-brand-soft p-6">
        <h2 className="font-semibold">Open to everyone</h2>
        <p className="mt-1 text-sm">
          {site.nameLatin} is built by and for the Habesha community, and every listing is open to
          everyone, as Fair Housing law requires.
        </p>
      </div>

      <p className="mt-8 text-sm text-muted">
        Questions or ideas?{" "}
        <Link href="/contact" className="font-semibold text-brand hover:underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
