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

// Public place label: "Havana & Iliff, Aurora", or "Del Mar, Aurora" when no nearby
// major intersection is known yet.
export function placeLabel(place: { crossStreets?: string | null; neighborhood: string; city: string }) {
  return `${place.crossStreets || place.neighborhood}, ${place.city}`;
}
