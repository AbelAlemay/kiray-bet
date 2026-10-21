import "server-only";

// Turns a street address into map coordinates. Brand-new streets (new subdivisions) are
// often missing from every address database for months, so instead of rejecting a real
// address we fall back step by step, and say how precise the result is:
//   1. "exact":  the US Census geocoder (free, no key), then OpenStreetMap, find the address.
//   2. "street": the address isn't known, but the street (or a street of the same name, e.g.
//                "N Duquesne Ct" for "N Duquesne Way") is, in that city and ZIP code.
//   3. "zip":    only the ZIP code is known; the point is the ZIP code area.
// Returns null only when even the ZIP code can't be placed. The admin review shows a note
// for anything less than "exact". The exact point is stored privately; the public map only
// gets a blurred version. Also returns the official city name ("aurora" -> "Aurora").

export type LocationPrecision = "exact" | "street" | "zip";

export type GeocodeResult = { lat: number; lng: number; city: string | null; precision: LocationPrecision };

export async function geocodeAddress(street: string, city: string, state: string, zip: string): Promise<GeocodeResult | null> {
  const census = await censusLookup(street, city, state, zip);
  if (census) return census;

  const exact = await osmSearch({ street, city, state, postalcode: zip });
  if (exact?.houseNumber) return { ...exact.point, precision: "exact" };

  const streetName = withoutHouseNumber(street);
  const sameStreet = exact ?? (await osmSearch({ street: streetName, city, state, postalcode: zip }));
  if (sameStreet && sameStreet.zip === zip) return { ...sameStreet.point, precision: "street" };

  // A street with the same name nearby ("Duquesne Way" -> "Duquesne Ct" in the same ZIP).
  const baseName = withoutStreetType(streetName);
  if (baseName && baseName !== streetName) {
    const similar = await osmSearch({ q: `${baseName}, ${city}, ${state} ${zip}` });
    if (similar && similar.zip === zip) return { ...similar.point, precision: "street" };
  }

  // OpenStreetMap only finds a ZIP code searched on its own; check it's in the right state.
  const area = await osmSearch({ postalcode: zip });
  if (area && area.zip === zip && area.state === state) return { ...area.point, precision: "zip" };
  return null;
}

async function censusLookup(street: string, city: string, state: string, zip: string): Promise<GeocodeResult | null> {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/address");
  url.search = new URLSearchParams({ street, city, state, zip, benchmark: "Public_AR_Current", format: "json" }).toString();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match) return null;
    const officialCity: unknown = match.addressComponents?.city;
    return {
      lat: Number(match.coordinates.y),
      lng: Number(match.coordinates.x),
      city: typeof officialCity === "string" && officialCity ? titleCase(officialCity) : null,
      precision: "exact",
    };
  } catch {
    return null;
  }
}

type OsmHit = { point: { lat: number; lng: number; city: string | null }; houseNumber: boolean; zip: string | null; state: string | null };

// OpenStreetMap's Nominatim. Its rules allow at most one request per second, so lookups
// are spaced out (they only run when the Census geocoder didn't find the address).
let lastOsmCall = 0;
async function osmSearch(params: Record<string, string>): Promise<OsmHit | null> {
  const wait = lastOsmCall + 1100 - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastOsmCall = Date.now();

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.search = new URLSearchParams({ ...params, format: "jsonv2", addressdetails: "1", limit: "1", countrycodes: "us" }).toString();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
      headers: { "User-Agent": "KirayBet (rental listings; kiraybet.org)" },
    });
    if (!res.ok) return null;
    const [hit] = await res.json();
    if (!hit) return null;
    const a = hit.address ?? {};
    const place: unknown = a.city ?? a.town ?? a.village ?? a.hamlet ?? null;
    return {
      point: { lat: Number(hit.lat), lng: Number(hit.lon), city: typeof place === "string" ? place : null },
      houseNumber: !!a.house_number,
      zip: typeof a.postcode === "string" ? a.postcode.slice(0, 5) : typeof hit.name === "string" && /^\d{5}$/.test(hit.name) ? hit.name : null,
      // "US-CO" -> "CO"
      state: typeof a["ISO3166-2-lvl4"] === "string" ? a["ISO3166-2-lvl4"].replace(/^US-/, "") : null,
    };
  } catch {
    return null;
  }
}

// "3487 N Duquesne Way" -> "N Duquesne Way"
function withoutHouseNumber(street: string) {
  return street.replace(/^\s*\d+[a-z]?\s+/i, "").trim();
}

// "N Duquesne Way" -> "N Duquesne"
const streetTypes =
  /\s+(st|street|ave|avenue|way|ct|court|dr|drive|rd|road|ln|lane|cir|circle|pl|place|blvd|boulevard|pkwy|parkway|ter|terrace|trl|trail|loop|row|sq|square|hwy|highway)\.?$/i;
function withoutStreetType(street: string) {
  return street.replace(streetTypes, "").trim();
}

// "SILVER SPRING" -> "Silver Spring"
function titleCase(text: string) {
  return text.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
}
