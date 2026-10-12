-- Admin review: two-step login required for admin powers, and a note to the host
-- when a listing isn't approved.

-- Admin powers need a session confirmed with an authenticator app code ("aal2"),
-- so a stolen password or email link alone can't approve listings or read reports.
create or replace function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.jwt() ->> 'aal'), '') = 'aal2'
     and exists (
       select 1 from public.profiles
       where id = (select auth.uid()) and role = 'admin'
     );
$$;

-- Why a listing wasn't approved, shown to its host. Written only by the admin.
alter table public.listings
  add column review_note text check (char_length(review_note) <= 500);
grant update (review_note) on public.listings to authenticated;

create or replace function private.listings_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();

  if not private.is_end_user() or private.is_admin() then
    if new.status is distinct from old.status and new.status in ('active', 'rejected') then
      new.reviewed_at := now();
    end if;
    return new;
  end if;

  if new.review_note is distinct from old.review_note then
    raise exception 'Only an admin can write review notes';
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

  if (to_jsonb(new) - '{status,available_from,updated_at,reviewed_at}'::text[])
     is distinct from
     (to_jsonb(old) - '{status,available_from,updated_at,reviewed_at}'::text[]) then
    new.status := 'pending';
    new.reviewed_at := null;
  end if;

  return new;
end;
$$;
