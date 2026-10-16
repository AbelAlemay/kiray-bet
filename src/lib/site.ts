export const site = {
  name: "ኪራይ ቤት",
  nameLatin: "KirayBet",
  tagline: "Homes for rent from our community, in 11 U.S. metro areas",
  // General headline (pages show the chosen area's own headline from regions.ts).
  taglineAm: "የሚከራዩ ቤቶች ከማህበረሰባችን",
  listingTypes: [
    { value: "house", label: "House", labelAm: "ሙሉ ቤት" },
    { value: "apartment", label: "Apartment", labelAm: "አፓርትመንት" },
    { value: "basement", label: "Basement", labelAm: "ቤዝመንት" },
    { value: "room", label: "Room", labelAm: "ክፍል" },
  ],
} as const;

export type ListingType = (typeof site.listingTypes)[number]["value"];

// The utilities a host pays when they're included in the rent.
export const utilityList = "electricity, gas, water, sewer and trash";

// For the lease only (the site itself doesn't say who pays): hosts renting out a room or
// basement pay the utilities; for a whole house or apartment the renter does.
export function utilitiesIncluded(type: string) {
  return type === "room" || type === "basement";
}

// Amenities a host can tick (same list as the database allows).
export const amenityOptions = [
  { value: "wifi", label: "Wi-Fi included" },
  { value: "furnished", label: "Furnished" },
  { value: "washer_dryer", label: "Washer & dryer in unit" },
  { value: "shared_laundry", label: "Shared laundry" },
  { value: "ac", label: "Air conditioning" },
  { value: "private_bath", label: "Private bathroom" },
  { value: "private_entrance", label: "Private entrance" },
  { value: "own_kitchen", label: "Own kitchen" },
  { value: "dishwasher", label: "Dishwasher" },
  { value: "yard", label: "Yard or patio" },
  { value: "storage", label: "Storage space" },
  { value: "near_transit", label: "Near bus or train" },
] as const;

export type Amenity = (typeof amenityOptions)[number]["value"];

// Amenities that can't both be true: ticking one unticks the other.
export const exclusiveAmenities: Partial<Record<Amenity, Amenity>> = {
  washer_dryer: "shared_laundry",
  shared_laundry: "washer_dryer",
};

export function amenityLabels(amenities: readonly string[]) {
  return amenityOptions.filter((a) => amenities.includes(a.value)).map((a) => a.label);
}
