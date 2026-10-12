import "server-only";

// Turns a street address into map coordinates using the free US Census geocoder
// (no API key; US addresses only). Returns null when the address can't be found.
// The exact point is stored privately; the public map only gets a blurred version.
export async function geocodeAddress(street: string, city: string, zip: string) {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/address");
  url.search = new URLSearchParams({
    street,
    city,
    state: "CO",
    zip,
    benchmark: "Public_AR_Current",
    format: "json",
  }).toString();

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10_000), cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match) return null;
    return { lat: Number(match.coordinates.y), lng: Number(match.coordinates.x) };
  } catch {
    return null;
  }
}

// Same bounds the database enforces on listing_addresses.
export function inDenverMetro({ lat, lng }: { lat: number; lng: number }) {
  return lat >= 39.3 && lat <= 40.3 && lng >= -105.5 && lng <= -104.3;
}
