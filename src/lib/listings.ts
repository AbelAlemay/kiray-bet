import { cacheLife, cacheTag } from "next/cache";
import { sampleListings, type Listing } from "./sample-listings";
import { site, type ListingType } from "./site";
import { createPublicClient } from "./supabase/public";

// Data access for public listings. Reads approved listings from Supabase, or the
// sample data when Supabase isn't configured yet (see .env.example).
// Cached under the "listings" tag; call revalidateTag("listings") after a listing
// is approved, edited or removed.

export type ListingFilters = {
  city?: string;
  type?: ListingType;
  maxPrice?: number;
  minBedrooms?: number;
  pets?: boolean;
  parking?: boolean;
  utilities?: boolean;
  // Available on or before this date (YYYY-MM-DD).
  availableBy?: string;
  sort: "newest" | "price-asc" | "price-desc";
  // How many pages of results to show ("Show more" adds one).
  page: number;
};

export const pageSize = 20;

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

  const availableBy = first(params.availableBy);
  const page = Math.floor(positiveNumber(first(params.page)) ?? 1);

  return {
    city: site.cities.find((c) => c === city),
    type: site.listingTypes.find((t) => t.value === type)?.value,
    maxPrice: positiveNumber(first(params.maxPrice)),
    minBedrooms: positiveNumber(first(params.minBedrooms)),
    pets: first(params.pets) === "1" || undefined,
    parking: first(params.parking) === "1" || undefined,
    utilities: first(params.utilities) === "1" || undefined,
    availableBy:
      availableBy && /^\d{4}-\d{2}-\d{2}$/.test(availableBy) && !Number.isNaN(Date.parse(availableBy))
        ? availableBy
        : undefined,
    sort: sortOptions.find((o) => o.value === sort)?.value ?? "newest",
    page: Math.min(page, 25),
  };
}

// The URL for a set of filters (defaults left out), e.g. for chips and "Show more".
export function filtersToQuery(filters: Partial<ListingFilters>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === false || value === "") continue;
    if ((key === "sort" && value === "newest") || (key === "page" && value === 1)) continue;
    params.set(key, value === true ? "1" : String(value));
  }
  const query = params.toString();
  return query ? `/search?${query}` : "/search";
}

const listingColumns =
  "id, title, type, price, deposit, bedrooms, bathrooms, city, neighborhood, available_from, " +
  "utilities_included, parking, pets_allowed, description, created_at, approx_lat, approx_lng, " +
  "host:profiles!listings_host_id_fkey(display_name), listing_photos(path, order)";

type ListingRow = {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  neighborhood: string;
  available_from: string;
  utilities_included: boolean;
  parking: boolean;
  pets_allowed: boolean;
  description: string;
  created_at: string;
  approx_lat: number | null;
  approx_lng: number | null;
  host: { display_name: string | null } | null;
  listing_photos: { path: string; order: number }[];
};

type PublicClient = NonNullable<ReturnType<typeof createPublicClient>>;

// The photo bucket is private, so pages get signed links. They last a day, well past
// how long these cached results are kept.
async function toListings(supabase: PublicClient, rows: ListingRow[]): Promise<Listing[]> {
  const paths = rows.flatMap((r) => r.listing_photos.map((p) => p.path));
  const { data: signed } = paths.length
    ? await supabase.storage.from("listing-photos").createSignedUrls(paths, 60 * 60 * 24)
    : { data: [] };
  const urls = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));

  return rows.map((row) => ({
    ...toListing(row),
    photos: [...row.listing_photos]
      .sort((a, b) => a.order - b.order)
      .map((p) => urls.get(p.path))
      .filter((url): url is string => !!url),
  }));
}

function toListing(row: ListingRow): Omit<Listing, "photos"> {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    price: row.price,
    deposit: row.deposit,
    bedrooms: row.bedrooms,
    bathrooms: Number(row.bathrooms),
    city: row.city,
    neighborhood: row.neighborhood,
    availableFrom: row.available_from,
    utilitiesIncluded: row.utilities_included,
    parking: row.parking,
    petsAllowed: row.pets_allowed,
    description: row.description,
    hostName: row.host?.display_name ?? "Host",
    postedAt: row.created_at.slice(0, 10),
    approxLat: row.approx_lat,
    approxLng: row.approx_lng,
  };
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The filter methods used below; every Supabase query returns itself from them.
type Filterable = {
  eq(column: string, value: unknown): Filterable;
  lte(column: string, value: unknown): Filterable;
  gte(column: string, value: unknown): Filterable;
};

// Applies the search filters to any listings query, keeping its type.
function applyFilters<Q>(query: Q, filters: ListingFilters): Q {
  let q = (query as Filterable).eq("status", "active");
  if (filters.city) q = q.eq("city", filters.city);
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.maxPrice) q = q.lte("price", filters.maxPrice);
  if (filters.minBedrooms) q = q.gte("bedrooms", filters.minBedrooms);
  if (filters.pets) q = q.eq("pets_allowed", true);
  if (filters.parking) q = q.eq("parking", true);
  if (filters.utilities) q = q.eq("utilities_included", true);
  if (filters.availableBy) q = q.lte("available_from", filters.availableBy);
  return q as Q;
}

function matchesSample(l: Listing, filters: ListingFilters) {
  return (
    (!filters.city || l.city === filters.city) &&
    (!filters.type || l.type === filters.type) &&
    (!filters.maxPrice || l.price <= filters.maxPrice) &&
    (!filters.minBedrooms || l.bedrooms >= filters.minBedrooms) &&
    (!filters.pets || l.petsAllowed) &&
    (!filters.parking || l.parking) &&
    (!filters.utilities || l.utilitiesIncluded) &&
    (!filters.availableBy || l.availableFrom <= filters.availableBy)
  );
}

// The first `page` pages of matching listings, plus how many match in total.
export async function getListings(filters: ListingFilters): Promise<{ listings: Listing[]; total: number }> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  const supabase = createPublicClient();
  if (supabase) {
    let query = applyFilters(supabase.from("listings").select(listingColumns, { count: "exact" }), filters);
    query =
      filters.sort === "newest"
        ? query.order("created_at", { ascending: false })
        : query.order("price", { ascending: filters.sort === "price-asc" });

    const { data, count, error } = await query
      .order("id")
      .range(0, filters.page * pageSize - 1)
      .overrideTypes<ListingRow[], { merge: false }>();
    if (error) throw new Error(`Couldn't load listings: ${error.message}`);
    return { listings: await toListings(supabase, data), total: count ?? data.length };
  }

  const results = sampleListings
    .filter((l) => matchesSample(l, filters))
    .sort((a, b) => {
      if (filters.sort === "price-asc") return a.price - b.price;
      if (filters.sort === "price-desc") return b.price - a.price;
      return b.postedAt.localeCompare(a.postedAt);
    });
  return { listings: results.slice(0, filters.page * pageSize), total: results.length };
}

export async function getLatestListings(count: number): Promise<Listing[]> {
  return (await getListings({ sort: "newest", page: 1 })).listings.slice(0, count);
}

// Everything the map needs for all matching listings (no photos, no paging).
export type ListingPin = {
  id: string;
  title: string;
  price: number;
  type: ListingType;
  neighborhood: string;
  city: string;
  lat: number;
  lng: number;
};

export async function getListingPins(filters: ListingFilters): Promise<ListingPin[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  const supabase = createPublicClient();
  const rows = supabase
    ? ((
        await applyFilters(
          supabase.from("listings").select("id, title, price, type, neighborhood, city, approx_lat, approx_lng"),
          filters,
        ).limit(500)
      ).data ?? [])
    : sampleListings.filter((l) => matchesSample(l, filters)).map((l) => ({ ...l, approx_lat: l.approxLat, approx_lng: l.approxLng }));

  return rows
    .filter((r) => r.approx_lat != null && r.approx_lng != null)
    .map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      type: r.type as ListingType,
      neighborhood: r.neighborhood,
      city: r.city,
      lat: Number(r.approx_lat),
      lng: Number(r.approx_lng),
    }));
}

// How many live listings each city has, for the home page.
export async function getCityCounts(): Promise<Record<string, number>> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  const supabase = createPublicClient();
  const cities = supabase
    ? ((await supabase.from("listings").select("city").eq("status", "active").limit(5000)).data ?? []).map((r) => r.city)
    : sampleListings.map((l) => l.city);
  const counts: Record<string, number> = {};
  for (const city of cities) counts[city] = (counts[city] ?? 0) + 1;
  return counts;
}

export async function getListing(id: string): Promise<Listing | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings", `listing-${id}`);

  const supabase = createPublicClient();
  if (supabase) {
    if (!uuidPattern.test(id)) return undefined;
    const { data, error } = await supabase
      .from("listings")
      .select(listingColumns)
      .eq("id", id)
      .eq("status", "active")
      .maybeSingle()
      .overrideTypes<ListingRow, { merge: false }>();
    if (error) throw new Error(`Couldn't load listing: ${error.message}`);
    return data ? (await toListings(supabase, [data]))[0] : undefined;
  }

  return sampleListings.find((l) => l.id === id);
}
