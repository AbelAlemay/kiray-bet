export function formatDate(iso: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", options);
}

export function formatPrice(amount: number) {
  return `$${amount.toLocaleString("en-US")}`;
}

// "Oct 12, 3:45 PM" in Denver time (fixed time zone, so server and browser agree).
export function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
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

// "Near Havana & Iliff, Aurora", or just "Aurora" when nothing more precise is known.
export function nearLabel(place: Parameters<typeof placeLabel>[0]) {
  return place.crossStreets || place.neighborhood ? `Near ${placeLabel(place)}` : place.city;
}
