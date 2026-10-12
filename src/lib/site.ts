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
