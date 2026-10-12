import type { Metadata } from "next";
import { Suspense } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ListingCard } from "@/components/ListingCard";
import { SearchFilters } from "@/components/SearchFilters";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getListings, parseFilters, type ListingFilters } from "@/lib/listings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Browse homes for rent",
};

// One removable chip per active filter, each linking to the search without it.
function activeFilterChips(filters: ListingFilters) {
  const chips: { key: keyof ListingFilters; label: string }[] = [];
  if (filters.city) chips.push({ key: "city", label: filters.city });
  if (filters.type) chips.push({ key: "type", label: site.listingTypes.find((t) => t.value === filters.type)!.label });
  if (filters.maxPrice) chips.push({ key: "maxPrice", label: `Under ${formatPrice(filters.maxPrice)}` });
  if (filters.minBedrooms) chips.push({ key: "minBedrooms", label: `${filters.minBedrooms}+ bedrooms` });

  return chips.map((chip) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(filters)) {
      if (key !== chip.key && value && !(key === "sort" && value === "newest")) params.set(key, String(value));
    }
    const query = params.toString();
    return { ...chip, href: query ? `/search?${query}` : "/search" };
  });
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const listings = await getListings(filters);
  const chips = activeFilterChips(filters);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <FiltersPanel activeCount={chips.length}>
          <SearchFilters filters={filters} />
        </FiltersPanel>
      </aside>
      <div>
        {chips.length > 0 && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <Link
                key={chip.key}
                href={chip.href}
                aria-label={`Remove filter: ${chip.label}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:border-brand"
              >
                {chip.label} <span aria-hidden className="text-muted">✕</span>
              </Link>
            ))}
            <Link
              href="/search"
              className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-brand hover:underline"
            >
              Clear all
            </Link>
          </div>
        )}
        <p className="mb-4 text-sm text-muted" aria-live="polite">
          {listings.length} {listings.length === 1 ? "home" : "homes"} found
          {filters.city && ` in ${filters.city}`}
        </p>
        {listings.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No homes match these filters.</p>
            <p className="mt-1 text-sm text-muted">ምንም ቤት አልተገኘም። Try a higher price or another city.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="h-96 animate-pulse rounded-2xl bg-border/50" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-border/50" />
        ))}
      </div>
    </div>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Homes for rent</h1>
      <p className="mb-4 text-muted sm:mb-6">ለኪራይ የሚሆኑ ቤቶች · Denver metro</p>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
