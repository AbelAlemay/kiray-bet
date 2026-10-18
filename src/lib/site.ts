// The Terms of Service version people agree to (its "last updated" date). Change it
// together with the date on the Terms page to ask everyone to agree again.
export const termsVersion = "2026-10-15";

export const site = {
  name: "ኪራይ ቤት",
  nameLatin: "KirayBet",
  tagline: "Homes for rent from our community, in 11 U.S. metro areas",
  // General headline (pages show the chosen area's own headline from regions.ts).
  taglineAm: "የሚከራዩ ቤቶች ከማህበረሰባችን",
  // Other ways people write the name, for search engines.
  otherNames: ["Kiray Bet", "Kiraybet", "ኪራይ ቤት"],
  // For search results and share previews.
  seoTitle: "KirayBet (Kiray Bet · ኪራይ ቤት): Homes for rent in our community",
  seoTitleAm: "ኪራይ ቤት (KirayBet · Kiray Bet)፦ ከማህበረሰባችን የሚከራዩ ቤቶች",
  seoDescription:
    "KirayBet (Kiray Bet) helps the Ethiopian and Eritrean (Habesha) community find houses, apartments, basements and rooms for rent in Denver, Washington DC, Seattle, Dallas, Houston, Atlanta, Minneapolis, Los Angeles and more. Free, private, in English and Amharic.",
  seoDescriptionAm:
    "ኪራይ ቤት (KirayBet) የኢትዮጵያና የኤርትራ (ሐበሻ) ማህበረሰብ በዴንቨር፣ በዋሽንግተን ዲሲ፣ በሲያትል፣ በዳላስ፣ በሂውስተን፣ በአትላንታ፣ በሚኒያፖሊስ፣ በሎስ አንጀለስና በሌሎችም የሚከራዩ ቤቶችን፣ አፓርትመንቶችን፣ ቤዝመንቶችንና ክፍሎችን እንዲያገኝ ይረዳል። ነጻ፣ የግል፣ በአማርኛና በእንግሊዝኛ።",
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
  { value: "wifi", label: "Wi-Fi included", labelAm: "ዋይፋይ ተካትቷል", short: "Wi-Fi", shortAm: "ዋይፋይ" },
  { value: "furnished", label: "Furnished", labelAm: "የቤት ዕቃ ያለው", short: "Furnished", shortAm: "ዕቃ ያለው" },
  { value: "washer_dryer", label: "Washer & dryer in unit", labelAm: "በቤቱ ውስጥ የልብስ ማጠቢያና ማድረቂያ", short: "Washer & dryer", shortAm: "ልብስ ማጠቢያ" },
  { value: "shared_laundry", label: "Shared laundry", labelAm: "የጋራ ልብስ ማጠቢያ", short: "Shared laundry", shortAm: "የጋራ ልብስ ማጠቢያ" },
  { value: "ac", label: "Air conditioning", labelAm: "ኤር ኮንዲሽነር (አየር ማቀዝቀዣ)", short: "A/C", shortAm: "ኤሲ" },
  { value: "private_bath", label: "Private bathroom", labelAm: "የግል መታጠቢያ ቤት", short: "Private bath", shortAm: "የግል መታጠቢያ" },
  { value: "private_entrance", label: "Private entrance", labelAm: "የግል መግቢያ በር", short: "Private entrance", shortAm: "የግል መግቢያ" },
  { value: "own_kitchen", label: "Own kitchen", labelAm: "የግል ኩሽና", short: "Own kitchen", shortAm: "የግል ኩሽና" },
  { value: "dishwasher", label: "Dishwasher", labelAm: "የሳህን ማጠቢያ ማሽን", short: "Dishwasher", shortAm: "ሳህን ማጠቢያ" },
  { value: "yard", label: "Yard or patio", labelAm: "ግቢ ወይም በረንዳ", short: "Yard", shortAm: "ግቢ" },
  { value: "storage", label: "Storage space", labelAm: "የዕቃ ማስቀመጫ ቦታ", short: "Storage", shortAm: "ማስቀመጫ" },
  { value: "near_transit", label: "Near bus or train", labelAm: "ለአውቶቡስ ወይም ባቡር ቅርብ", short: "Near transit", shortAm: "ለትራንስፖርት ቅርብ" },
] as const;

export type Amenity = (typeof amenityOptions)[number]["value"];

// Amenities that can't both be true: ticking one unticks the other.
export const exclusiveAmenities: Partial<Record<Amenity, Amenity>> = {
  washer_dryer: "shared_laundry",
  shared_laundry: "washer_dryer",
};

export function amenityLabels(amenities: readonly string[], lang: "en" | "am" = "en") {
  return amenityOptions.filter((a) => amenities.includes(a.value)).map((a) => (lang === "am" ? a.labelAm : a.label));
}

// Short feature tags for listing cards: parking and pets first, then amenities.
export function featureTags(
  home: { parking: boolean; petsAllowed: boolean; amenities: readonly string[] },
  lang: "en" | "am" = "en",
) {
  const tags: string[] = [];
  if (home.parking) tags.push(lang === "am" ? "መኪና ማቆሚያ" : "Parking");
  if (home.petsAllowed) tags.push(lang === "am" ? "እንስሳ ይፈቀዳል" : "Pets OK");
  for (const a of amenityOptions) if (home.amenities.includes(a.value)) tags.push(lang === "am" ? a.shortAm : a.short);
  return tags;
}
