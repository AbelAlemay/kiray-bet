-- Posting-form feedback (Oct 2026):
--  * Longer titles and descriptions.
--  * Neighborhood is optional: hosts often don't know it, so it's filled in from the map
--    when the listing is approved.
--  * Utilities are a checklist instead of one yes/no.
--  * The host chooses whether the exact address is public.

alter table public.listings drop constraint listings_title_check;
alter table public.listings add constraint listings_title_check check (char_length(title) between 5 and 300);
alter table public.listings drop constraint listings_description_check;
alter table public.listings add constraint listings_description_check check (char_length(description) between 20 and 20000);

alter table public.listings alter column neighborhood drop not null;

alter table public.listings
  add column utilities text[] not null default '{}'
    check (utilities <@ array['electricity', 'gas', 'water', 'sewer', 'trash', 'internet']::text[]);
update public.listings set utilities = array['electricity', 'gas', 'water', 'sewer', 'trash'] where utilities_included;

-- utilities_included (used by search) follows the checklist.
create function private.sync_utilities_included() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.utilities_included := cardinality(new.utilities) > 0;
  return new;
end;
$$;
create trigger listings_sync_utilities
  before insert or update of utilities on public.listings
  for each row execute function private.sync_utilities_included();

-- false = show only the nearest intersection (address shared on request);
-- true = show the exact address on the public listing.
alter table public.listings add column show_exact_address boolean not null default false;

grant insert (utilities, show_exact_address) on public.listings to authenticated;
grant update (utilities, show_exact_address, neighborhood) on public.listings to authenticated;

-- Anyone may read the address of a live listing whose host chose to show it.
grant select on public.listing_addresses to anon;
create policy "listing_addresses: public when the host shows it" on public.listing_addresses
  for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active' and l.show_exact_address
    )
  );
