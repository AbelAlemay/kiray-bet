import type { Metadata } from "next";
import { Suspense } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ListingCard } from "@/components/ListingCard";
import { SearchFilters } from "@/components/SearchFilters";
import { getListings, parseFilters } from "@/lib/listings";

export const metadata: Metadata = {
  title: "Browse homes for rent",
};

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const listings = await getListings(filters);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <FiltersPanel
          activeCount={[filters.city, filters.type, filters.maxPrice, filters.minBedrooms].filter(Boolean).length}
        >
          <SearchFilters filters={filters} />
        </FiltersPanel>
      </aside>
      <div>
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
