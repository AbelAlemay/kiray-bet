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

const listingColumns =
  "id, title, type, price, deposit, bedrooms, bathrooms, city, neighborhood, available_from, " +
  "utilities_included, parking, pets_allowed, description, created_at, host:profiles!listings_host_id_fkey(display_name), " +
  "listing_photos(path, order)";

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
  };
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getListings(filters: ListingFilters): Promise<Listing[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("listings");

  const supabase = createPublicClient();
  if (supabase) {
    let query = supabase.from("listings").select(listingColumns).eq("status", "active");
    if (filters.city) query = query.eq("city", filters.city);
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
    if (filters.minBedrooms) query = query.gte("bedrooms", filters.minBedrooms);
    query =
      filters.sort === "newest"
        ? query.order("created_at", { ascending: false })
        : query.order("price", { ascending: filters.sort === "price-asc" });

    const { data, error } = await query.limit(100).overrideTypes<ListingRow[], { merge: false }>();
    if (error) throw new Error(`Couldn't load listings: ${error.message}`);
    return toListings(supabase, data);
  }

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

export async function getLatestListings(count: number): Promise<Listing[]> {
  return (await getListings({ sort: "newest" })).slice(0, count);
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
