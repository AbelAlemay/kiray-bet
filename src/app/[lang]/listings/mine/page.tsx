import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { formatPrice, placeLabel } from "@/lib/format";
import { leaseStates } from "@/lib/regions";
import { createServerSupabase } from "@/lib/supabase/server";
import { ListingActions } from "./ListingActions";
import { LinkPending } from "@/components/Pending";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("My listings", "የእኔ ማስታወቂያዎች"), robots: { index: false } };
}

const statusLabels = {
  pending: { label: "Waiting for review", labelAm: "በግምገማ ላይ", className: "bg-accent/20 text-foreground" },
  active: { label: "Live", labelAm: "ታትሟል", className: "bg-brand-soft text-brand" },
  rejected: { label: "Not approved", labelAm: "አልጸደቀም", className: "bg-danger/10 text-danger" },
  rented: { label: "Rented", labelAm: "ተከራይቷል", className: "bg-border text-muted" },
} as const;

type Row = {
  id: string;
  title: string;
  status: keyof typeof statusLabels;
  price: number;
  city: string;
  neighborhood: string | null;
  cross_streets: string | null;
  state: string;
  review_note: string | null;
  listing_photos: { path: string; order: number }[];
};

async function MyListings({ searchParams }: { searchParams: PageProps<"/[lang]/listings/mine">["searchParams"] }) {
  const user = await requireUser("/listings/mine");
  const { posted, updated, deleted } = await searchParams;
  const t = await getT();
  const notice =
    updated === "review"
      ? t(
          "Saved. Your changes are waiting for a quick review; the listing is hidden until they're approved.",
          "ተቀምጧል። ለውጦችዎ አጭር ግምገማ እየጠበቁ ነው፤ እስኪጸድቁ ድረስ ማስታወቂያው አይታይም።",
        )
      : updated
        ? t.both("Saved.", "ተቀምጧል።")
        : deleted
          ? t("Listing deleted.", "ማስታወቂያው ተሰርዟል።")
          : null;

  // The host's own client: the database returns only this host's listings (any status).
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("listings")
    .select("id, title, status, price, city, state, neighborhood, cross_streets, review_note, listing_photos(path, order)")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false })
    .overrideTypes<Row[], { merge: false }>();
  const listings = data ?? [];

  // Short-lived links to each cover photo (the bucket is private).
  const covers = listings
    .map((l) => [...l.listing_photos].sort((a, b) => a.order - b.order)[0]?.path)
    .filter((p): p is string => !!p);
  const { data: signed } = covers.length
    ? await supabase.storage.from("listing-photos").createSignedUrls(covers, 3600)
    : { data: [] };
  const coverUrl = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return (
    <div className="space-y-4">
      {posted && (
        <div role="status" className="rounded-2xl bg-brand-soft p-5">
          <p className="font-semibold">
            {t.both("Thanks! Your listing was sent for review.", "እናመሰግናለን! ማስታወቂያዎ ለግምገማ ተልኳል።")}
          </p>
          <p className="mt-1 text-sm">
            {t(
              "A person checks every listing before it appears, usually within a day. It will show as “Live” here once it's approved.",
              "እያንዳንዱ ማስታወቂያ ከመታየቱ በፊት በሰው ይመረመራል፤ ብዙውን ጊዜ በአንድ ቀን ውስጥ። ሲጸድቅ እዚህ “ታትሟል” ተብሎ ይታያል።",
            )}
          </p>
        </div>
      )}
      {notice && (
        <p role="status" className="rounded-2xl bg-brand-soft p-4 text-sm font-semibold">
          {notice}
        </p>
      )}
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="font-semibold">{t("You haven't posted any homes yet.", "እስካሁን ምንም ቤት አላስተዋወቁም።")}</p>
          <Link href="/listings/new" className="mt-3 inline-block font-semibold text-brand hover:underline">
            {t("Post a home →", "ቤት ያስተዋውቁ →")}
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((l) => {
            const status = statusLabels[l.status];
            const cover = [...l.listing_photos].sort((a, b) => a.order - b.order)[0];
            const src = cover && coverUrl.get(cover.path);
            return (
              <li key={l.id} className="flex flex-wrap gap-4 rounded-2xl border border-border bg-surface p-3 sm:flex-nowrap">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- short-lived signed link
                  <img src={src} alt="" className="h-20 w-28 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="h-20 w-28 shrink-0 rounded-lg bg-border/50" />
                )}
                <div className="min-w-0 flex-1">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                    {t.both(status.label, status.labelAm)}
                  </span>
                  <p className="mt-1 truncate font-semibold">{l.title}</p>
                  <p className="text-sm text-muted">
                    {formatPrice(l.price)}
                    {t("/mo", "/በወር")} · {placeLabel({ ...l, crossStreets: l.cross_streets })}
                  </p>
                  {l.status === "rejected" && l.review_note && (
                    <p className="mt-1 text-sm text-danger">
                      {t(
                        `Reviewer's note: ${l.review_note}. Edit the listing to fix it and resubmit.`,
                        `የገምጋሚው ማስታወሻ፦ ${l.review_note}። ለማስተካከል ማስታወቂያውን አርመው እንደገና ይላኩ።`,
                      )}
                    </p>
                  )}
                </div>
                <div className="self-center">
                  <ListingActions id={l.id} status={l.status} leaseAvailable={leaseStates.includes(l.state)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default async function MyListingsPage({ searchParams }: PageProps<"/[lang]/listings/mine">) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-bold sm:text-3xl">{t.both("My listings", "የእኔ ቤቶች")}</h1>
        <Link href="/listings/new" className="relative whitespace-nowrap rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong">
          <LinkPending />
          + {t("Post a home", "ቤት ያስተዋውቁ")}
        </Link>
      </div>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-border/50" />}>
        <MyListings searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
