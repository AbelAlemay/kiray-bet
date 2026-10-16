import "server-only";

// The neighborhood name around a point, from OpenStreetMap (Nominatim), or null.
// Called with the blurred map point when a listing is approved. OpenStreetMap knows
// many neighborhoods inside big cities but few in suburbs, so null is common; the
// nearest-intersection label is what pages mainly show.
export async function findNeighborhood(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: { "User-Agent": "KirayBet (rental listings; kiraybet.org)" },
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    const address = (await res.json()).address ?? {};
    const name: unknown = address.neighbourhood ?? address.suburb ?? address.quarter ?? address.city_district;
    return typeof name === "string" ? tidyName(name) : null;
  } catch {
    return null;
  }
}

// "North Hollywood Neighborhood Council District" -> "North Hollywood",
// "Hamline - Midway" -> "Hamline-Midway". Exported for the seed tools.
export function tidyName(name: string) {
  const tidy = name
    .replace(/\s+(Neighborhood Council( District)?|District)$/i, "")
    .replace(/\s+-\s+/g, "-")
    .trim()
    .slice(0, 60);
  return tidy || null;
}
