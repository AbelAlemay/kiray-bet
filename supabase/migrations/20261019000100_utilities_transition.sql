-- Transition: listings saved by the old form send only utilities_included = true with an
-- empty checklist; keep them as "common utilities included" instead of turning them off.
create or replace function private.sync_utilities_included() returns trigger
language plpgsql set search_path = '' as $$
begin
  if cardinality(new.utilities) = 0 and new.utilities_included
     and (tg_op = 'INSERT' or new.utilities is not distinct from old.utilities) then
    new.utilities := array['electricity', 'gas', 'water', 'sewer', 'trash'];
  end if;
  new.utilities_included := cardinality(new.utilities) > 0;
  return new;
end;
$$;

drop trigger listings_sync_utilities on public.listings;
create trigger listings_sync_utilities
  before insert or update of utilities, utilities_included on public.listings
  for each row execute function private.sync_utilities_included();
