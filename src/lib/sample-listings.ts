import type { ListingType } from "./site";

// Placeholder data until Supabase is connected (build step 3).
export type Listing = {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  neighborhood: string;
  availableFrom: string;
  utilitiesIncluded: boolean;
  parking: boolean;
};

export const sampleListings: Listing[] = [
  {
    id: "1",
    title: "Bright 3-bed house near Havana St",
    type: "house",
    price: 2450,
    bedrooms: 3,
    bathrooms: 2,
    city: "Aurora",
    neighborhood: "Del Mar",
    availableFrom: "2026-11-01",
    utilitiesIncluded: false,
    parking: true,
  },
  {
    id: "2",
    title: "Private basement unit with own entrance",
    type: "basement",
    price: 1150,
    bedrooms: 1,
    bathrooms: 1,
    city: "Aurora",
    neighborhood: "Mission Viejo",
    availableFrom: "2026-10-20",
    utilitiesIncluded: true,
    parking: true,
  },
  {
    id: "3",
    title: "Furnished room, quiet household",
    type: "room",
    price: 750,
    bedrooms: 1,
    bathrooms: 1,
    city: "Denver",
    neighborhood: "Montbello",
    availableFrom: "2026-10-15",
    utilitiesIncluded: true,
    parking: false,
  },
  {
    id: "4",
    title: "2-bed apartment close to light rail",
    type: "apartment",
    price: 1750,
    bedrooms: 2,
    bathrooms: 1,
    city: "Lakewood",
    neighborhood: "Belmar",
    availableFrom: "2026-12-01",
    utilitiesIncluded: false,
    parking: true,
  },
  {
    id: "5",
    title: "Family home with big backyard",
    type: "house",
    price: 2900,
    bedrooms: 4,
    bathrooms: 3,
    city: "Centennial",
    neighborhood: "Willow Creek",
    availableFrom: "2026-11-15",
    utilitiesIncluded: false,
    parking: true,
  },
  {
    id: "6",
    title: "Cozy studio-style basement",
    type: "basement",
    price: 950,
    bedrooms: 1,
    bathrooms: 1,
    city: "Englewood",
    neighborhood: "Cherry Hills",
    availableFrom: "2026-10-25",
    utilitiesIncluded: true,
    parking: false,
  },
];
