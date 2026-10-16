import "server-only";

// Turns a street address into map coordinates using the free US Census geocoder
// (no API key; US addresses only). Returns null when the address can't be found.
// The exact point is stored privately; the public map only gets a blurred version.
// Also returns the official city name (e.g. "aurora" typed -> "Aurora").
export async function geocodeAddress(street: string, city: string, state: string, zip: string) {
  const url = new URL("https://geocoding.geo.census.gov/geocoder/locations/address");
  url.search = new URLSearchParams({
    street,
    city,
    state,
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
    const officialCity: unknown = match.addressComponents?.city;
    return {
      lat: Number(match.coordinates.y),
      lng: Number(match.coordinates.x),
      city: typeof officialCity === "string" && officialCity ? titleCase(officialCity) : null,
    };
  } catch {
    return null;
  }
}

// "SILVER SPRING" -> "Silver Spring"
function titleCase(text: string) {
  return text.toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, sep, letter) => sep + letter.toUpperCase());
}
