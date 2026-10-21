-- How precisely the address was placed on the map: "exact" (the address was found),
-- "street" (only the street, or a same-named street nearby, e.g. a brand-new subdivision),
-- or "zip" (only the ZIP code area). The admin review shows a note for anything not exact.
alter table public.listing_addresses
  add column location_precision text not null default 'exact'
    check (location_precision in ('exact', 'street', 'zip'));
