import { sampleListings, type Listing } from "./sample-listings";
import { site, type ListingType } from "./site";

// Data access for listings. Backed by sample data for now; swap these
// function bodies for Supabase queries in build step 3.

export type ListingFilters = {
  city?: string;
  type?: ListingType;
  maxPrice?: number;
  minBedrooms?: number;
  sort: "newest" | "price-asc" | "price-desc";
};

export const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

type RawParams = { [key: string]: string | string[] | undefined };

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function positiveNumber(value: string | undefined) {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 ? n : undefined;
}

// Turns untrusted URL search params into validated filters.
export function parseFilters(params: RawParams): ListingFilters {
  const city = first(params.city);
  const type = first(params.type);
  const sort = first(params.sort);

  return {
    city: site.cities.find((c) => c === city),
    type: site.listingTypes.find((t) => t.value === type)?.value,
    maxPrice: positiveNumber(first(params.maxPrice)),
    minBedrooms: positiveNumber(first(params.minBedrooms)),
    sort: sortOptions.find((o) => o.value === sort)?.value ?? "newest",
  };
}

export async function getListings(filters: ListingFilters): Promise<Listing[]> {
  const results = sampleListings.filter(
    (l) =>
      (!filters.city || l.city === filters.city) &&
      (!filters.type || l.type === filters.type) &&
      (!filters.maxPrice || l.price <= filters.maxPrice) &&
      (!filters.minBedrooms || l.bedrooms >= filters.minBedrooms),
  );

  return results.sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    return b.postedAt.localeCompare(a.postedAt);
  });
}

export async function getListing(id: string): Promise<Listing | undefined> {
  return sampleListings.find((l) => l.id === id);
}
