import { stateNames } from "./regions";
import { amenityOptions, site, type Amenity, type ListingType } from "./site";

// Rules for what hosts may write in a listing. Shared by the posting form (instant
// feedback) and the server (the real check).

export const maxPhotos = 10;

// Fair Housing: ads may not state a preference based on national origin, race,
// religion, sex, disability or family status. The site is community-focused, but
// every listing must be open to everyone.
const fairHousingPatterns = [
  /\b(only|just|prefer(?:red|s)?|looking for)\s+(an?\s+)?(habesha|ethiopian|eritrean|african|american|white|black|asian|hispanic|latino|christian|muslim|orthodox|protestant|catholic|jewish)s?\b/i,
  /\b(habesha|ethiopian|eritrean|african|american|white|black|asian|hispanic|latino|christian|muslim|orthodox|protestant|catholic|jewish)s?\s+(only|preferred)\b/i,
  /\bno\s+(kids|children|families|babies|wheelchairs?|disabled|section\s*8)\b/i,
  /\b(adults?|singles?|couples?)\s+only\b/i,
  /(ሀበሻ|ሐበሻ|ሃበሻ|ኢትዮጵያ|ኤርትራ|ክርስቲያን|ሙስሊም|ኦርቶዶክስ|ጴንጤ)\S*\s*ብቻ/,
];

// Contact and payment details stay out of listings: renters reach hosts through
// messages on the site, and no money changes hands before a viewing and a lease.
const contactPatterns = [
  /\(?\b\d{3}\)?[\s.-]*\d{3}[\s.-]*\d{4}\b/, // phone numbers
  /[^\s@]+@[^\s@]+\.[a-z]{2,}/i, // email addresses
  /\b(zelle|cash\s*app|cashapp|venmo|paypal|western\s+union|moneygram|wire\s+transfer|gift\s*cards?)\b/i,
  /\b(whats\s*app|telegram|wa\.me|t\.me)\b/i,
];

export function fairHousingProblem(text: string) {
  return fairHousingPatterns.some((p) => p.test(text))
    ? "Listings must be open to everyone. Please remove wording that limits who can rent " +
        "(for example by background, religion, or families with children)."
    : null;
}

export function contactInfoProblem(text: string) {
  return contactPatterns.some((p) => p.test(text))
    ? "Please don't include phone numbers, emails, other apps or payment details. " +
        "Renters contact you through messages on the site."
    : null;
}

export type ListingInput = {
  id: string;
  title: string;
  description: string;
  type: ListingType;
  price: number;
  deposit: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  state: string;
  available_from: string;
  amenities: Amenity[];
  parking: boolean;
  pets_allowed: boolean;
  // true = the exact address is shown on the public listing.
  show_exact_address: boolean;
};

export type AddressInput = { street_address: string; unit: string | null; zip: string };

export type ListingErrors = Partial<Record<string, string>>;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function whole(value: string, min: number, max: number) {
  const n = Number(value);
  return value !== "" && Number.isInteger(n) && n >= min && n <= max ? n : null;
}

// Validates the posting form. Limits match the database's own checks.
export function parseListingForm(formData: FormData, hostId: string) {
  const errors: ListingErrors = {};

  const id = text(formData, "listingId");
  const title = text(formData, "title");
  const description = text(formData, "description");
  const type = site.listingTypes.find((t) => t.value === text(formData, "type"))?.value;
  const city = text(formData, "city");
  const state = text(formData, "state").toUpperCase();
  const price = whole(text(formData, "price"), 1, 100000);
  const deposit = whole(text(formData, "deposit") || "0", 0, 100000);
  const bedrooms = whole(text(formData, "bedrooms"), 0, 20);
  const bathroomsRaw = Number(text(formData, "bathrooms"));
  const bathrooms =
    text(formData, "bathrooms") !== "" && bathroomsRaw >= 0 && bathroomsRaw <= 20 && (bathroomsRaw * 2) % 1 === 0
      ? bathroomsRaw
      : null;
  const availableFrom = text(formData, "availableFrom");
  const street = text(formData, "street");
  const unit = text(formData, "unit");
  const zip = text(formData, "zip");
  const photos = formData.getAll("photos").map(String);
  const amenities = amenityOptions.map((a) => a.value).filter((a) => formData.getAll("amenities").includes(a));
  const addressChoice = text(formData, "addressVisibility");

  if (!uuidPattern.test(id)) errors.form = "Something went wrong. Please reload the page and try again.";
  if (title.length < 5) errors.title = "Write at least 5 characters.";
  if (title.length > 300) errors.title = "That's a very long title. Please keep it under 300 characters.";
  if (description.length < 20) errors.description = "Write at least 20 characters about the home.";
  if (description.length > 20000) errors.description = "Please keep the description under 20,000 characters.";
  if (!type) errors.type = "Choose the type of home.";
  if (!/^[\p{L}][\p{L} .'-]{1,59}$/u.test(city)) errors.city = "Enter the city.";
  if (!stateNames[state]) errors.state = "Choose the state.";
  if (price === null) errors.price = "Enter the monthly rent in whole dollars.";
  if (deposit === null) errors.deposit = "Enter the deposit in whole dollars (0 if none).";
  if (bedrooms === null) errors.bedrooms = "Enter the number of bedrooms.";
  if (bathrooms === null) errors.bathrooms = "Enter bathrooms (for example 1 or 1.5).";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableFrom) || Number.isNaN(Date.parse(availableFrom))) {
    errors.availableFrom = "Choose the date it's available.";
  }
  if (street.length < 3 || street.length > 100) errors.street = "Enter the street address.";
  if (unit.length > 20) errors.unit = "Keep the unit short (for example Apt 4 or Basement).";
  if (!/^\d{5}$/.test(zip)) errors.zip = "Enter a 5-digit ZIP code.";
  if (addressChoice !== "private" && addressChoice !== "public") {
    errors.addressVisibility = "Choose whether to show the exact address or keep it private.";
  }

  const writing = `${title}\n${description}`;
  const writingProblem = fairHousingProblem(writing) ?? contactInfoProblem(writing);
  if (writingProblem) errors.description = writingProblem;

  // Photos were uploaded into the host's folder for this listing; accept nothing else.
  const folder = `${hostId}/${id}/`;
  if (photos.length === 0) errors.photos = "Add at least one photo.";
  else if (photos.length > maxPhotos) errors.photos = `Add up to ${maxPhotos} photos.`;
  else if (photos.some((p) => !p.startsWith(folder) || !/^[\w/-]+\.jpg$/.test(p))) {
    errors.photos = "Please re-add your photos.";
  }

  if (Object.keys(errors).length > 0) return { errors } as const;

  const listing: ListingInput = {
    id,
    title,
    description,
    type: type!,
    price: price!,
    deposit: deposit!,
    bedrooms: bedrooms!,
    bathrooms: bathrooms!,
    city,
    state,
    available_from: availableFrom,
    amenities,
    show_exact_address: addressChoice === "public",
    parking: formData.get("parking") === "on",
    pets_allowed: formData.get("petsAllowed") === "on",
  };
  const address: AddressInput = { street_address: street, unit: unit || null, zip };
  return { listing, address, photos } as const;
}
