import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { SearchFilters } from "@/components/SearchFilters";
import { formatDate, formatPrice } from "@/lib/format";
import {
  filtersToQuery,
  getListingPins,
  getListings,
  pageSize,
  parseFilters,
  type ListingFilters,
} from "@/lib/listings";
import type { Listing } from "@/lib/sample-listings";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Browse homes for rent",
};

type View = "list" | "map";
const views: { id: View; label: string }[] = [
  { id: "list", label: "☰ List" },
  { id: "map", label: "🗺 Map" },
];

// Search URL for these filters, keeping the view choice.
function searchHref(filters: Partial<ListingFilters>, view: View) {
  const href = filtersToQuery(filters);
  if (view === "list") return href;
  return href + (href.includes("?") ? "&" : "?") + `view=${view}`;
}

// One removable chip per active filter, each linking to the search without it.
function activeFilterChips(filters: ListingFilters, view: View) {
  const chips: { key: keyof ListingFilters; label: string }[] = [];
  if (filters.city) chips.push({ key: "city", label: filters.city });
  if (filters.type) chips.push({ key: "type", label: site.listingTypes.find((t) => t.value === filters.type)!.label });
  if (filters.maxPrice) chips.push({ key: "maxPrice", label: `Under ${formatPrice(filters.maxPrice)}` });
  if (filters.minBedrooms) chips.push({ key: "minBedrooms", label: `${filters.minBedrooms}+ bedrooms` });
  if (filters.availableBy) {
    chips.push({ key: "availableBy", label: `Available by ${formatDate(filters.availableBy)}` });
  }
  if (filters.pets) chips.push({ key: "pets", label: "Pets allowed" });
  if (filters.parking) chips.push({ key: "parking", label: "Parking" });
  if (filters.utilities) chips.push({ key: "utilities", label: "Utilities included" });

  return chips.map((chip) => ({
    ...chip,
    href: searchHref({ ...filters, [chip.key]: undefined, page: 1 }, view),
  }));
}

const toggleClass = "flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-semibold sm:flex-none";

function MapNote() {
  return (
    <p className="text-xs text-muted">
      🔒 Pins show each home&apos;s approximate area (about 1 km), never the exact address. Zoom in to
      see homes that share an area.
    </p>
  );
}

// Listing cards plus "Show more".
function ListingGrid({
  listings,
  total,
  filters,
  view,
  columns,
}: {
  listings: Listing[];
  total: number;
  filters: ListingFilters;
  view: View;
  columns: string;
}) {
  return (
    <>
      <div className={`grid gap-5 ${columns}`}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
      {listings.length < total && (
        <div className="mt-6 text-center">
          <Link
            href={searchHref({ ...filters, page: filters.page + 1 }, view)}
            scroll={false}
            className="inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-6 font-semibold hover:bg-brand-soft"
          >
            Show more ({Math.min(pageSize, total - listings.length)} of {total - listings.length} more)
          </Link>
        </div>
      )}
    </>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const view: View = params.view === "map" ? "map" : "list";
  const chips = activeFilterChips(filters, view);

  const [{ listings, total }, pins] = await Promise.all([
    view === "list" ? getListings(filters) : Promise.resolve({ listings: [], total: 0 }),
    view === "map" ? getListingPins({ ...filters, page: 1 }) : Promise.resolve([]),
  ]);
  const count = view === "map" ? pins.length : total;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <FiltersPanel activeCount={chips.length}>
          <SearchFilters filters={filters} view={view} />
        </FiltersPanel>
      </aside>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted" aria-live="polite">
            {count} {count === 1 ? "home" : "homes"} found
            {filters.city && ` in ${filters.city}`}
          </p>
          <nav aria-label="View" className="flex w-full gap-1 rounded-xl border border-border bg-surface p-1 sm:w-auto">
            {views.map((v) => (
              <Link
                key={v.id}
                href={searchHref({ ...filters, page: 1 }, v.id)}
                aria-current={v.id === view ? "page" : undefined}
                className={`${toggleClass} ${v.id === view ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
              >
                {v.label}
              </Link>
            ))}
          </nav>
        </div>

        {chips.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
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
              href={searchHref({}, view)}
              className="inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-brand hover:underline"
            >
              Clear all
            </Link>
          </div>
        )}

        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">No homes match these filters.</p>
            <p className="mt-1 text-sm text-muted">ምንም ቤት አልተገኘም። Try a higher price or another city.</p>
          </div>
        ) : view === "map" ? (
          <div className="space-y-2">
            <ListingsMap pins={pins} />
            <MapNote />
          </div>
        ) : (
          <ListingGrid listings={listings} total={total} filters={filters} view={view} columns="sm:grid-cols-2 xl:grid-cols-3" />
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
