import { translator, type T } from "./i18n";
import { stateNames } from "./regions";
import { amenityOptions, exclusiveAmenities, site, type Amenity, type ListingType } from "./site";

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

const english = translator("en");

export function fairHousingProblem(text: string, t: T = english) {
  return fairHousingPatterns.some((p) => p.test(text))
    ? t(
        "Listings must be open to everyone. Please remove wording that limits who can rent (for example by background, religion, or families with children).",
        "ማስታወቂያዎች ለሁሉም ክፍት መሆን አለባቸው። እባክዎ ማን መከራየት እንደሚችል የሚገድብ አነጋገር ያስወግዱ (ለምሳሌ በትውልድ፣ በሃይማኖት ወይም ልጆች ያሏቸውን ቤተሰቦች)።",
      )
    : null;
}

export function contactInfoProblem(text: string, t: T = english) {
  return contactPatterns.some((p) => p.test(text))
    ? t(
        "Please don't include phone numbers, emails, other apps or payment details. Renters contact you through messages on the site.",
        "እባክዎ ስልክ ቁጥር፣ ኢሜይል፣ ሌሎች መተግበሪያዎችን ወይም የክፍያ መረጃ አያካትቱ። ተከራዮች የሚያገኙዎት በድረ-ገጹ መልዕክት ነው።",
      )
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
export function parseListingForm(formData: FormData, hostId: string, t: T = english) {
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
  const ticked = formData.getAll("amenities");
  // Of two amenities that can't both be true, keep the first in the list.
  const amenities = amenityOptions
    .map((a) => a.value)
    .filter((a) => ticked.includes(a))
    .filter((a, i, kept) => {
      const other = exclusiveAmenities[a];
      return !other || !kept.slice(0, i).includes(other);
    });
  const addressChoice = text(formData, "addressVisibility");

  if (!uuidPattern.test(id)) {
    errors.form = t("Something went wrong. Please reload the page and try again.", "ችግር ተፈጥሯል። እባክዎ ገጹን አድሰው እንደገና ይሞክሩ።");
  }
  if (title.length < 5) errors.title = t("Write at least 5 characters.", "ቢያንስ 5 ፊደላት ይጻፉ።");
  if (title.length > 300) {
    errors.title = t("That's a very long title. Please keep it under 300 characters.", "ርዕሱ በጣም ረጅም ነው። እባክዎ ከ300 ፊደላት በታች ያድርጉት።");
  }
  if (description.length < 20) errors.description = t("Write at least 20 characters about the home.", "ስለ ቤቱ ቢያንስ 20 ፊደላት ይጻፉ።");
  if (description.length > 20000) {
    errors.description = t("Please keep the description under 20,000 characters.", "እባክዎ መግለጫውን ከ20,000 ፊደላት በታች ያድርጉት።");
  }
  if (!type) errors.type = t("Choose the type of home.", "የቤቱን ዓይነት ይምረጡ።");
  if (!/^[\p{L}][\p{L} .'-]{1,59}$/u.test(city)) errors.city = t("Enter the city.", "ከተማውን ያስገቡ።");
  if (!stateNames[state]) errors.state = t("Choose the state.", "ስቴቱን ይምረጡ።");
  if (price === null) errors.price = t("Enter the monthly rent in whole dollars.", "ወርሃዊ ኪራዩን በሙሉ ዶላር ያስገቡ።");
  if (deposit === null) {
    errors.deposit = t("Enter the deposit in whole dollars (0 if none).", "ቅድመ ክፍያውን በሙሉ ዶላር ያስገቡ (ከሌለ 0)።");
  }
  if (bedrooms === null) errors.bedrooms = t("Enter the number of bedrooms.", "የመኝታ ክፍሎችን ብዛት ያስገቡ።");
  if (bathrooms === null) errors.bathrooms = t("Enter bathrooms (for example 1 or 1.5).", "መታጠቢያ ቤቶችን ያስገቡ (ለምሳሌ 1 ወይም 1.5)።");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(availableFrom) || Number.isNaN(Date.parse(availableFrom))) {
    errors.availableFrom = t("Choose the date it's available.", "ቤቱ የሚገኝበትን ቀን ይምረጡ።");
  }
  if (street.length < 3 || street.length > 100) errors.street = t("Enter the street address.", "የመንገድ አድራሻውን ያስገቡ።");
  if (unit.length > 20) {
    errors.unit = t("Keep the unit short (for example Apt 4 or Basement).", "የዩኒቱን ስም አጭር ያድርጉ (ለምሳሌ Apt 4 ወይም Basement)።");
  }
  if (!/^\d{5}$/.test(zip)) errors.zip = t("Enter a 5-digit ZIP code.", "ባለ 5 አሃዝ ዚፕ ኮድ ያስገቡ።");
  if (addressChoice !== "private" && addressChoice !== "public") {
    errors.addressVisibility = t(
      "Choose whether to show the exact address or keep it private.",
      "ትክክለኛውን አድራሻ ለማሳየት ወይም በግል ለማቆየት ይምረጡ።",
    );
  }

  const writing = `${title}\n${description}`;
  const writingProblem = fairHousingProblem(writing, t) ?? contactInfoProblem(writing, t);
  if (writingProblem) errors.description = writingProblem;

  // Photos were uploaded into the host's folder for this listing; accept nothing else.
  const folder = `${hostId}/${id}/`;
  if (photos.length === 0) errors.photos = t("Add at least one photo.", "ቢያንስ አንድ ፎቶ ያክሉ።");
  else if (photos.length > maxPhotos) errors.photos = t(`Add up to ${maxPhotos} photos.`, `እስከ ${maxPhotos} ፎቶዎች ያክሉ።`);
  else if (photos.some((p) => !p.startsWith(folder) || !/^[\w/-]+\.jpg$/.test(p))) {
    errors.photos = t("Please re-add your photos.", "እባክዎ ፎቶዎችዎን እንደገና ያክሉ።");
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
