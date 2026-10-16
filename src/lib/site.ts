export const site = {
  name: "ኪራይ ቤት",
  nameLatin: "KirayBet",
  tagline: "Homes for rent in Denver, from our community",
  taglineAm: "የሚከራዩ ቤቶች በዴንቨር እና አካባቢው",
  cities: ["Aurora", "Denver", "Lakewood", "Englewood", "Centennial", "Littleton", "Thornton"],
  listingTypes: [
    { value: "house", label: "House", labelAm: "ሙሉ ቤት" },
    { value: "apartment", label: "Apartment", labelAm: "አፓርትመንት" },
    { value: "basement", label: "Basement", labelAm: "ቤዝመንት" },
    { value: "room", label: "Room", labelAm: "ክፍል" },
  ],
} as const;

export type ListingType = (typeof site.listingTypes)[number]["value"];

// Utilities a host can say are included in the rent (same list as the database allows).
export const utilityOptions = [
  { value: "electricity", label: "Electricity", short: "electricity", labelAm: "መብራት" },
  { value: "gas", label: "Gas / heat", short: "gas", labelAm: "ጋዝ / ማሞቂያ" },
  { value: "water", label: "Water", short: "water", labelAm: "ውሃ" },
  { value: "sewer", label: "Sewer", short: "sewer", labelAm: "ፍሳሽ" },
  { value: "trash", label: "Trash", short: "trash", labelAm: "ቆሻሻ" },
  { value: "internet", label: "Internet / Wi-Fi", short: "internet", labelAm: "ኢንተርኔት" },
] as const;

export type Utility = (typeof utilityOptions)[number]["value"];

// "Water, trash" / "All utilities" / "" for display.
export function utilitiesLabel(utilities: readonly string[]) {
  if (utilities.length === utilityOptions.length) return "All utilities";
  const names = utilityOptions.filter((u) => utilities.includes(u.value)).map((u) => u.short).join(", ");
  return names.charAt(0).toUpperCase() + names.slice(1);
}
