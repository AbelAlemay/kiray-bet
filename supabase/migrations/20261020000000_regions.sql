-- More metro areas (Oct 2026). Each listing belongs to one area, worked out by the
-- database from the address's map point (so it can't be set to something else), and
-- has a state for showing addresses. Existing listings are in Denver, Colorado.
-- Keep the area boxes in sync with `regions` in src/lib/regions.ts.

create function private.region_for(lat double precision, lng double precision) returns text
language sql immutable set search_path = '' as $$
  select case
    when lat between 39.3 and 40.3 and lng between -105.5 and -104.3 then 'denver'
    when lat between 38.4 and 39.6 and lng between -77.9 and -76.4 then 'dmv'
    when lat between 46.9 and 48.1 and lng between -122.6 and -121.7 then 'seattle'
    when lat between 32.4 and 33.4 and lng between -97.7 and -96.4 then 'dfw'
    when lat between 29.9 and 30.8 and lng between -98.1 and -97.4 then 'austin'
    when lat between 29.3 and 30.3 and lng between -95.9 and -94.9 then 'houston'
    when lat between 44.6 and 45.4 and lng between -93.8 and -92.8 then 'msp'
    when lat between 45.2 and 45.9 and lng between -123.2 and -122.3 then 'portland'
    when lat between 33.4 and 34.2 and lng between -84.8 and -83.9 then 'atlanta'
    when lat between 37.1 and 38.1 and lng between -122.6 and -121.7 then 'bayarea'
    when lat between 32.5 and 34.6 and lng between -119.0 and -116.8 then 'socal'
  end;
$$;

alter table public.listings
  add column region text check (region in ('denver', 'dmv', 'seattle', 'dfw', 'austin', 'houston', 'msp', 'portland', 'atlanta', 'bayarea', 'socal')),
  add column state text not null default 'CO' check (state in ('CO', 'DC', 'MD', 'VA', 'WA', 'TX', 'MN', 'OR', 'GA', 'CA'));
update public.listings set region = 'denver';
create index listings_region_status_idx on public.listings (region, status, created_at desc);

grant insert (state) on public.listings to authenticated;
grant update (state) on public.listings to authenticated;

-- Addresses anywhere in the supported areas (was Denver-only).
alter table public.listing_addresses drop constraint listing_addresses_exact_lat_check;
alter table public.listing_addresses drop constraint listing_addresses_exact_lng_check;
alter table public.listing_addresses
  add constraint listing_addresses_in_supported_area check (private.region_for(exact_lat, exact_lng) is not null);

-- The blurred point and the area both come from the exact address.
create or replace function private.sync_approx_location() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.listings
  set approx_lat = round(new.exact_lat::numeric, 2),
      approx_lng = round(new.exact_lng::numeric, 2),
      region = private.region_for(new.exact_lat, new.exact_lng)
  where id = new.listing_id;
  return new;
end;
$$;

-- Hosts can't set the area themselves; only the address decides it.
create or replace function private.guard_region() returns trigger
language plpgsql set search_path = '' as $$
begin
  if private.is_end_user() and not private.is_admin()
     and new.region is distinct from old.region
     and new.region is distinct from private.region_for(
       (select exact_lat from public.listing_addresses where listing_id = new.id),
       (select exact_lng from public.listing_addresses where listing_id = new.id)) then
    raise exception 'The area is set from the address';
  end if;
  return new;
end;
$$;
create trigger listings_guard_region
  before update of region on public.listings
  for each row execute function private.guard_region();

grant execute on all functions in schema private to anon, authenticated, service_role;
