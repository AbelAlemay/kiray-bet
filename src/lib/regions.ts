// The metro areas KirayBet serves. A listing's area is worked out from its address's map
// point; the boxes here must match private.region_for() in the database
// (supabase/migrations/20261020000000_regions.sql).

export type Region = {
  id: string;
  name: string; // in the area switcher
  headlineAm: string; // the home page headline
  taglineEn: string; // under the headline
  states: string[];
  center: [number, number];
  zoom: number;
  box: { south: number; north: number; west: number; east: number };
  // Suggestions for the posting form (any city in the area is accepted).
  cities: string[];
};

export const regions = [
  {
    id: "denver",
    name: "Denver",
    headlineAm: "የሚከራዩ ቤቶች በዴንቨር እና አካባቢው",
    taglineEn: "Homes for rent in Denver and nearby, from our community",
    states: ["CO"],
    center: [39.72, -104.9],
    zoom: 10,
    box: { south: 39.3, north: 40.3, west: -105.5, east: -104.3 },
    cities: ["Denver", "Aurora", "Lakewood", "Englewood", "Centennial", "Littleton", "Thornton", "Arvada", "Westminster", "Parker", "Commerce City"],
  },
  {
    id: "dmv",
    name: "DC · Maryland · Virginia",
    headlineAm: "የሚከራዩ ቤቶች በዲሲ፣ በሜሪላንድ እና በቨርጂኒያ",
    taglineEn: "Homes for rent in DC, Maryland and Virginia, from our community",
    states: ["DC", "MD", "VA"],
    center: [38.95, -77.1],
    zoom: 10,
    box: { south: 38.4, north: 39.6, west: -77.9, east: -76.4 },
    cities: ["Washington", "Silver Spring", "Takoma Park", "Hyattsville", "Rockville", "Gaithersburg", "Germantown", "Bethesda", "College Park", "Laurel", "Arlington", "Alexandria", "Falls Church", "Fairfax", "Annandale", "Springfield", "Woodbridge"],
  },
  {
    id: "seattle",
    name: "Seattle",
    headlineAm: "የሚከራዩ ቤቶች በሲያትል እና አካባቢው",
    taglineEn: "Homes for rent in Seattle and nearby, from our community",
    states: ["WA"],
    center: [47.55, -122.25],
    zoom: 10,
    box: { south: 46.9, north: 48.1, west: -122.6, east: -121.7 },
    cities: ["Seattle", "Tukwila", "Renton", "SeaTac", "Burien", "Kent", "Federal Way", "Bellevue", "Shoreline", "Lynnwood", "Everett", "Tacoma"],
  },
  {
    id: "dfw",
    name: "Dallas–Fort Worth",
    headlineAm: "የሚከራዩ ቤቶች በዳላስ–ፎርት ዎርዝ እና አካባቢው",
    taglineEn: "Homes for rent in Dallas–Fort Worth, from our community",
    states: ["TX"],
    center: [32.85, -97.0],
    zoom: 9,
    box: { south: 32.4, north: 33.4, west: -97.7, east: -96.4 },
    cities: ["Dallas", "Fort Worth", "Arlington", "Garland", "Irving", "Richardson", "Plano", "Grand Prairie", "Mesquite", "Carrollton", "Euless"],
  },
  {
    id: "austin",
    name: "Austin",
    headlineAm: "የሚከራዩ ቤቶች በኦስቲን እና አካባቢው",
    taglineEn: "Homes for rent in Austin and nearby, from our community",
    states: ["TX"],
    center: [30.3, -97.75],
    zoom: 10,
    box: { south: 29.9, north: 30.8, west: -98.1, east: -97.4 },
    cities: ["Austin", "Round Rock", "Pflugerville", "Cedar Park", "Georgetown", "Kyle", "Leander", "San Marcos"],
  },
  {
    id: "houston",
    name: "Houston",
    headlineAm: "የሚከራዩ ቤቶች በሂውስተን እና አካባቢው",
    taglineEn: "Homes for rent in Houston and nearby, from our community",
    states: ["TX"],
    center: [29.76, -95.4],
    zoom: 10,
    box: { south: 29.3, north: 30.3, west: -95.9, east: -94.9 },
    cities: ["Houston", "Sugar Land", "Stafford", "Missouri City", "Pearland", "Katy", "Pasadena", "Spring", "The Woodlands"],
  },
  {
    id: "msp",
    name: "Minneapolis–Saint Paul",
    headlineAm: "የሚከራዩ ቤቶች በሚኒያፖሊስ–ሴንት ፖል እና አካባቢው",
    taglineEn: "Homes for rent in Minneapolis–Saint Paul, from our community",
    states: ["MN"],
    center: [44.96, -93.2],
    zoom: 10,
    box: { south: 44.6, north: 45.4, west: -93.8, east: -92.8 },
    cities: ["Minneapolis", "Saint Paul", "Bloomington", "Richfield", "Brooklyn Park", "Burnsville", "Eagan", "Roseville", "Maplewood"],
  },
  {
    id: "portland",
    name: "Portland",
    headlineAm: "የሚከራዩ ቤቶች በፖርትላንድ እና አካባቢው",
    taglineEn: "Homes for rent in Portland and nearby, from our community",
    states: ["OR", "WA"],
    center: [45.52, -122.65],
    zoom: 10,
    box: { south: 45.2, north: 45.9, west: -123.2, east: -122.3 },
    cities: ["Portland", "Beaverton", "Gresham", "Hillsboro", "Tigard", "Lake Oswego", "Vancouver"],
  },
  {
    id: "atlanta",
    name: "Atlanta",
    headlineAm: "የሚከራዩ ቤቶች በአትላንታ እና አካባቢው",
    taglineEn: "Homes for rent in Atlanta and nearby, from our community",
    states: ["GA"],
    center: [33.78, -84.3],
    zoom: 10,
    box: { south: 33.4, north: 34.2, west: -84.8, east: -83.9 },
    cities: ["Atlanta", "Clarkston", "Decatur", "Stone Mountain", "Tucker", "Marietta", "Smyrna", "Norcross", "Duluth", "Lawrenceville", "Sandy Springs"],
  },
  {
    id: "bayarea",
    name: "Oakland / SF Bay Area",
    headlineAm: "የሚከራዩ ቤቶች በኦክላንድ፣ በሳን ፍራንሲስኮ እና አካባቢው",
    taglineEn: "Homes for rent in Oakland, San Francisco and the Bay Area, from our community",
    states: ["CA"],
    center: [37.75, -122.25],
    zoom: 10,
    box: { south: 37.1, north: 38.1, west: -122.6, east: -121.7 },
    cities: ["Oakland", "San Francisco", "Berkeley", "Emeryville", "San Leandro", "Hayward", "Fremont", "San Jose", "Santa Clara", "Daly City", "Richmond"],
  },
  {
    id: "socal",
    name: "Los Angeles / Southern California",
    headlineAm: "የሚከራዩ ቤቶች በሎስ አንጀለስ እና በደቡብ ካሊፎርኒያ",
    taglineEn: "Homes for rent in Los Angeles and Southern California, from our community",
    states: ["CA"],
    center: [34.0, -118.2],
    zoom: 9,
    box: { south: 32.5, north: 34.6, west: -119.0, east: -116.8 },
    cities: ["Los Angeles", "Inglewood", "Long Beach", "Pasadena", "Glendale", "Torrance", "Anaheim", "Santa Ana", "Riverside", "San Bernardino", "San Diego"],
  },
] as const satisfies readonly Region[];

export type RegionId = (typeof regions)[number]["id"];

export const defaultRegionId: RegionId = "denver";

// Remembered choice in the area switcher.
export const regionCookie = "kb_region";

export function getRegion(id: string | undefined | null): Region & { id: RegionId } {
  return regions.find((r) => r.id === id) ?? regions[0];
}

export function isRegionId(id: unknown): id is RegionId {
  return typeof id === "string" && regions.some((r) => r.id === id);
}

// Which area a map point is in (same boxes as the database), or null.
export function regionFor(lat: number, lng: number): RegionId | null {
  const r = regions.find(({ box }) => lat >= box.south && lat <= box.north && lng >= box.west && lng <= box.east);
  return r?.id ?? null;
}

export const stateNames: Record<string, string> = {
  CO: "Colorado",
  DC: "District of Columbia",
  MD: "Maryland",
  VA: "Virginia",
  WA: "Washington",
  TX: "Texas",
  MN: "Minnesota",
  OR: "Oregon",
  GA: "Georgia",
  CA: "California",
};

// Lease agreements exist for these states so far (Colorado law).
export const leaseStates = ["CO"];
