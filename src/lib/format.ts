import type { Lang } from "./i18n";

// Amharic dates use the Gregorian calendar with Amharic month names ("ኦክቶ 20").
const locale = (lang: Lang) => (lang === "am" ? "am" : "en-US");

export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
  lang: Lang = "en",
) {
  return new Date(iso + "T00:00:00").toLocaleDateString(locale(lang), options);
}

export function formatPrice(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

// "Oct 12, 3:45 PM" in Denver time (fixed time zone, so server and browser agree).
export function formatMessageTime(iso: string, lang: Lang = "en") {
  return new Date(iso).toLocaleString(locale(lang), {
    timeZone: "America/Denver",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// Public place label: "Havana & Iliff, Aurora", "Del Mar, Aurora" when no nearby major
// intersection is known yet, or just "Aurora".
export function placeLabel(place: { crossStreets?: string | null; neighborhood?: string | null; city: string }) {
  const near = place.crossStreets || place.neighborhood;
  return near ? `${near}, ${place.city}` : place.city;
}

// "Near Havana & Iliff, Aurora" ("Havana & Iliff, Aurora አካባቢ"), or just "Aurora" when
// nothing more precise is known.
export function nearLabel(place: Parameters<typeof placeLabel>[0], lang: Lang = "en") {
  if (!place.crossStreets && !place.neighborhood) return place.city;
  return lang === "am" ? `${placeLabel(place)} አካባቢ` : `Near ${placeLabel(place)}`;
}

// "2 bd · 1 ba" / "Studio · 1 ba" ("2 መኝታ · 1 መታጠቢያ").
export function roomsLabel(bedrooms: number, bathrooms: number, lang: Lang = "en") {
  if (lang === "am") return `${bedrooms === 0 ? "ስቱዲዮ" : `${bedrooms} መኝታ`} · ${bathrooms} መታጠቢያ`;
  return `${bedrooms === 0 ? "Studio" : `${bedrooms} bd`} · ${bathrooms} ba`;
}
