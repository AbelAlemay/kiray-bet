-- Public location label: the nearest major intersection, e.g. "Havana & Iliff".
-- Worked out from the blurred map point when the admin approves a listing, so it
-- reveals no more than the map circle. Only the admin (or the server) may set it,
-- and it's cleared when the address changes so it gets recalculated.

alter table public.listings
  add column cross_streets text check (char_length(cross_streets) <= 80);
grant update (cross_streets) on public.listings to authenticated;

create or replace function private.listings_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();

  -- A new map point means the old intersection may be wrong.
  if new.approx_lat is distinct from old.approx_lat or new.approx_lng is distinct from old.approx_lng then
    new.cross_streets := null;
  end if;

  if not private.is_end_user() or private.is_admin() then
    if new.status is distinct from old.status and new.status in ('active', 'rejected') then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  if new.review_note is distinct from old.review_note then
    raise exception 'Only an admin can write review notes';
  end if;
  if new.cross_streets is distinct from old.cross_streets
     and not (new.cross_streets is null and (new.approx_lat is distinct from old.approx_lat or new.approx_lng is distinct from old.approx_lng)) then
    raise exception 'Only an admin can set the cross streets';
  end if;

  -- Hosts may resubmit for review (-> pending) or toggle active <-> rented.
  if new.status is distinct from old.status
     and new.status <> 'pending'
     and (old.status, new.status) not in (
       ('active'::public.listing_status, 'rented'::public.listing_status),
       ('rented'::public.listing_status, 'active'::public.listing_status)
     ) then
    raise exception 'Only an admin can change the review status of a listing';
  end if;

  if (to_jsonb(new) - '{status,available_from,updated_at,reviewed_at,cross_streets}'::text[])
     is distinct from
     (to_jsonb(old) - '{status,available_from,updated_at,reviewed_at,cross_streets}'::text[]) then
    new.status := 'pending';
    new.reviewed_at := null;
  end if;

  return new;
end;
$$;
