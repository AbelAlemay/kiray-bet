import type { ListingType } from "../site";

// The fields a host fills in to generate a lease. Templates use these names.
export const leaseFields = {
  landlord_name: "Landlord's full legal name",
  landlord_notice_address: "Landlord's mailing address for notices",
  landlord_contact: "Landlord's phone or email for repairs and notices",
  landlord_email: "Landlord's email for written notices (repairs, unsafe conditions)",
  tenant_names: "Tenant's full legal name(s)",
  other_occupants: "Other people who will live there (names, or 'None')",
  property_address: "Street address and unit",
  city: "City",
  zip: "ZIP code",
  lease_start: "Start date",
  fixed_term: "Fixed term (on) or month-to-month (off)",
  lease_end: "End date (fixed term)",
  monthly_rent: "Monthly rent ($)",
  rent_due_day: "Day of the month rent is due",
  payment_method: "How rent is paid",
  security_deposit: "Security deposit ($)",
  late_fee: "Late fee ($)",
  utilities_landlord: "Utilities the landlord pays",
  utilities_tenant: "Utilities the tenant pays",
  parking: "Parking included",
  parking_details: "Parking details",
  pets_allowed: "Pets allowed",
  pet_details: "Allowed pets",
  pet_deposit: "Pet deposit ($)",
  pet_rent: "Monthly pet rent ($)",
  radon_info: "What you know about radon at the home (tests, results, mitigation system)",
  pre_1978: "Built before 1978 (lead paint disclosure)",
  lead_info: "What you know about lead paint at the home, and any reports given to the tenant",
  furnished: "Furnished",
  furnishings: "Furniture and items provided",
  shared_spaces: "Shared spaces",
  house_rules: "House rules",
} as const;

export type LeaseField = keyof typeof leaseFields;

export const leaseTitles: Record<ListingType, string> = {
  house: "Residential Lease Agreement (Single-Family Home)",
  apartment: "Residential Lease Agreement (Apartment)",
  basement: "Lease Agreement for a Unit in an Owner-Occupied Home (Basement)",
  room: "Room Rental Agreement (Shared Home)",
};
