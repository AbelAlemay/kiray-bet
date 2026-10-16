import type { ListingType } from "./site";

// Fallback data shown until Supabase is configured. Mirrors supabase/seed.sql.
export type Listing = {
  id: string;
  title: string;
  type: ListingType;
  price: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  // Filled in from the map when approved; may be empty.
  neighborhood: string | null;
  availableFrom: string;
  utilitiesIncluded: boolean;
  // Included utilities, e.g. ["water", "trash"].
  utilities: string[];
  // The host chose to show the exact address publicly (then exactAddress is set).
  showExactAddress: boolean;
  exactAddress: string | null;
  parking: boolean;
  deposit: number;
  petsAllowed: boolean;
  description: string;
  hostName: string;
  postedAt: string;
  // Signed links to the photos, cover first. Sample listings have none.
  photos: string[];
  // Blurred map point (about 1 km), never the exact address.
  approxLat: number | null;
  approxLng: number | null;
  // Nearest major intersection, e.g. "Havana & Iliff" (set when approved).
  crossStreets: string | null;
  region: string;
  state: string;
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
    utilities: [],
    showExactAddress: false,
    exactAddress: null,
    parking: true,
    deposit: 2450,
    petsAllowed: false,
    description:
      "Sunny house on a quiet street, a short walk from Havana St shops, restaurants and the bus line. Updated kitchen, washer and dryer, fenced yard and a two-car driveway.",
    hostName: "Dawit",
    postedAt: "2026-10-08",
    photos: [],
    approxLat: 39.71,
    approxLng: -104.86,
    crossStreets: null,
    region: "denver",
    state: "CO",
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
    utilities: ["electricity", "gas", "water", "sewer", "trash"],
    showExactAddress: false,
    exactAddress: null,
    parking: true,
    deposit: 800,
    petsAllowed: false,
    description:
      "Fully separate basement with its own entrance, kitchenette and bathroom. Utilities and Wi-Fi are included. Off-street parking for one car.",
    hostName: "Selam",
    postedAt: "2026-10-09",
    photos: [],
    approxLat: 39.64,
    approxLng: -104.8,
    crossStreets: null,
    region: "denver",
    state: "CO",
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
    utilities: ["electricity", "gas", "water", "sewer", "trash"],
    showExactAddress: false,
    exactAddress: null,
    parking: false,
    deposit: 400,
    petsAllowed: false,
    description:
      "Furnished bedroom in a calm, clean home. Shared kitchen and bathroom. Utilities and internet included. Close to the bus to downtown and DIA.",
    hostName: "Meron",
    postedAt: "2026-10-10",
    photos: [],
    approxLat: 39.78,
    approxLng: -104.83,
    crossStreets: null,
    region: "denver",
    state: "CO",
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
    utilities: [],
    showExactAddress: false,
    exactAddress: null,
    parking: true,
    deposit: 1750,
    petsAllowed: true,
    description:
      "Second-floor apartment, a 5-minute walk to the W line light rail. In-unit laundry, one assigned parking spot and a small balcony.",
    hostName: "Yonas",
    postedAt: "2026-10-05",
    photos: [],
    approxLat: 39.71,
    approxLng: -105.08,
    crossStreets: null,
    region: "denver",
    state: "CO",
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
    utilities: [],
    showExactAddress: false,
    exactAddress: null,
    parking: true,
    deposit: 2900,
    petsAllowed: true,
    description:
      "Spacious family home in a good school district. Large backyard, finished basement, attached garage and central air.",
    hostName: "Hanna",
    postedAt: "2026-10-03",
    photos: [],
    approxLat: 39.59,
    approxLng: -104.88,
    crossStreets: null,
    region: "denver",
    state: "CO",
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
    utilities: ["electricity", "gas", "water", "sewer", "trash"],
    showExactAddress: false,
    exactAddress: null,
    parking: false,
    deposit: 600,
    petsAllowed: false,
    description:
      "Open-plan basement studio with its own bathroom and small kitchen. Utilities included. Street parking only.",
    hostName: "Tesfaye",
    postedAt: "2026-10-07",
    photos: [],
    approxLat: 39.64,
    approxLng: -104.96,
    crossStreets: null,
    region: "denver",
    state: "CO",
  },
];
