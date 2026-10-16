import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ListingCard } from "@/components/ListingCard";
import { ListingsMap } from "@/components/ListingsMap";
import { SearchFilters } from "@/components/SearchFilters";
import { formatDate, formatPrice } from "@/lib/format";
import { getChosenRegion } from "@/lib/region-server";
import { RegionSwitcher } from "@/components/RegionSwitcher";
import {
  filtersToQuery,
  getCityCounts,
  getListingPins,
  getListings,
  pageSize,
  parseFilters,
  type ListingFilters,
} from "@/lib/listings";
import type { Listing } from "@/lib/sample-listings";
import { site } from "@/lib/site";
import { LinkPending } from "@/components/Pending";
import { getT } from "@/lib/i18n-server";
import type { T } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Browse homes for rent", "የሚከራዩ ቤቶችን ይመልከቱ") };
}

type View = "list" | "map";
const views = (t: T): { id: View; label: string }[] => [
  { id: "list", label: `☰ ${t("List", "ዝርዝር")}` },
  { id: "map", label: `🗺 ${t("Map", "ካርታ")}` },
];

// Search URL for these filters, keeping the view choice.
function searchHref(filters: Partial<ListingFilters>, view: View) {
  const href = filtersToQuery(filters);
  if (view === "list") return href;
  return href + (href.includes("?") ? "&" : "?") + `view=${view}`;
}

// One removable chip per active filter, each linking to the search without it.
function activeFilterChips(filters: ListingFilters, view: View, t: T) {
  const chips: { key: keyof ListingFilters; label: string }[] = [];
  if (filters.city) chips.push({ key: "city", label: filters.city });
  if (filters.type) {
    const type = site.listingTypes.find((x) => x.value === filters.type)!;
    chips.push({ key: "type", label: t(type.label, type.labelAm) });
  }
  if (filters.maxPrice) {
    const price = formatPrice(filters.maxPrice);
    chips.push({ key: "maxPrice", label: t(`Under ${price}`, `ከ${price} በታች`) });
  }
  if (filters.minBedrooms) {
    chips.push({ key: "minBedrooms", label: t(`${filters.minBedrooms}+ bedrooms`, `${filters.minBedrooms}+ መኝታ ክፍሎች`) });
  }
  if (filters.availableBy) {
    const date = formatDate(filters.availableBy, undefined, t.lang);
    chips.push({ key: "availableBy", label: t(`Available by ${date}`, `እስከ ${date} የሚገኝ`) });
  }
  if (filters.pets) chips.push({ key: "pets", label: t("Pets allowed", "የቤት እንስሳ ይፈቀዳል") });
  if (filters.parking) chips.push({ key: "parking", label: t("Parking", "መኪና ማቆሚያ") });

  return chips.map((chip) => ({
    ...chip,
    href: searchHref({ ...filters, [chip.key]: undefined, page: 1 }, view),
  }));
}

const toggleClass = "relative flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-sm font-semibold sm:flex-none";

function MapNote({ t }: { t: T }) {
  return (
    <p className="text-xs text-muted">
      🔒{" "}
      {t(
        "Pins show each home's approximate area (about 1 km), never the exact address. Zoom in to see homes that share an area.",
        "ምልክቶቹ የእያንዳንዱን ቤት ግምታዊ ቦታ (1 ኪ.ሜ. ገደማ) ያሳያሉ እንጂ ትክክለኛውን አድራሻ አይደለም። አንድ ቦታ የሚጋሩ ቤቶችን ለማየት ያጉሉ።",
      )}
    </p>
  );
}

// Listing cards plus "Show more".
async function ListingGrid({
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
  const t = await getT();
  const more = total - listings.length;
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
            className="relative inline-flex min-h-11 items-center rounded-xl border border-border bg-surface px-6 font-semibold hover:bg-brand-soft"
          >
            <LinkPending />
            {t(
              `Show more (${Math.min(pageSize, more)} of ${more} more)`,
              `ተጨማሪ አሳይ (ከቀሩት ${more} ውስጥ ${Math.min(pageSize, more)})`,
            )}
          </Link>
        </div>
      )}
    </>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/[lang]/search">["searchParams"] }) {
  const params = await searchParams;
  const t = await getT();
  const region = await getChosenRegion(params.region);
  const filters = parseFilters(params, region.id);
  const view: View = params.view === "map" ? "map" : "list";
  const chips = activeFilterChips(filters, view, t);

  const [{ listings, total }, pins, cityCounts] = await Promise.all([
    view === "list" ? getListings(filters) : Promise.resolve({ listings: [], total: 0 }),
    view === "map" ? getListingPins({ ...filters, page: 1 }) : Promise.resolve([]),
    getCityCounts(filters.region),
  ]);
  // Cities with homes first, then the area's other main cities.
  const cities = [...new Set([...Object.keys(cityCounts), ...region.cities])];
  const count = view === "map" ? pins.length : total;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <FiltersPanel activeCount={chips.length}>
          <SearchFilters filters={filters} view={view} cities={cities} />
        </FiltersPanel>
      </aside>
      <div className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <RegionSwitcher current={region.id} />
            <p className="text-sm text-muted" aria-live="polite">
              {t(
                `${count} ${count === 1 ? "home" : "homes"} found${filters.city ? ` in ${filters.city}` : ""}`,
                `${filters.city ? `በ${filters.city} ` : ""}${count} ቤት${count === 1 ? "" : "ቶች"} ተገኝ${count === 1 ? "ቷል" : "ተዋል"}`,
              )}
            </p>
          </div>
          <nav aria-label={t("View", "አቀራረብ")} className="flex w-full gap-1 rounded-xl border border-border bg-surface p-1 sm:w-auto">
            {views(t).map((v) => (
              <Link
                key={v.id}
                href={searchHref({ ...filters, page: 1 }, v.id)}
                aria-current={v.id === view ? "page" : undefined}
                className={`${toggleClass} ${v.id === view ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
              >
                <LinkPending />
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
                aria-label={t(`Remove filter: ${chip.label}`, `ማጣሪያውን ያስወግዱ፦ ${chip.label}`)}
                className="relative inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:border-brand"
              >
                <LinkPending />
                {chip.label} <span aria-hidden className="text-muted">✕</span>
              </Link>
            ))}
            <Link
              href={searchHref({ region: filters.region }, view)}
              className="relative inline-flex min-h-10 items-center rounded-full px-3 text-sm font-semibold text-brand hover:underline"
            >
              <LinkPending />
              {t("Clear all", "ሁሉንም አጽዳ")}
            </Link>
          </div>
        )}

        {count === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center">
            <p className="font-semibold">{t("No homes match these filters.", "ከእነዚህ ማጣሪያዎች ጋር የሚስማማ ቤት የለም።")}</p>
            <p className="mt-1 text-sm text-muted">
              {t("ምንም ቤት አልተገኘም። Try a higher price or another city.", "ከፍ ያለ ዋጋ ወይም ሌላ ከተማ ይሞክሩ።")}
            </p>
          </div>
        ) : view === "map" ? (
          <div className="space-y-2">
            <ListingsMap pins={pins} center={region.center} zoom={region.zoom} />
            <MapNote t={t} />
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

export default async function SearchPage({ searchParams }: PageProps<"/[lang]/search">) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6 sm:pt-8">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("Homes for rent", "የሚከራዩ ቤቶች")}</h1>
      <p className="mb-4 text-muted sm:mb-6">{t("ለኪራይ የሚሆኑ ቤቶች", "Homes for rent")}</p>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
