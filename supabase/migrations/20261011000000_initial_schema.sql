-- KirayBet initial schema. See PLAN.md sections 3 (security) and 8 (data model).
--
-- Rules of thumb used throughout:
--   * Row Level Security is enabled on every table; nothing is readable without a policy.
--   * Supabase's default "grant all" is revoked; each role gets only the columns it may write.
--   * Helper functions live in the `private` schema, which the API does not expose.
--   * Public data (listings, photos, first names) is separate from private data
--     (emails, exact addresses, messages).

create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------------------
create type public.listing_type as enum ('house', 'apartment', 'basement', 'room');
create type public.listing_status as enum ('pending', 'active', 'rejected', 'rented');
create type public.user_role as enum ('renter', 'host', 'admin');
create type public.address_request_status as enum ('pending', 'approved', 'declined', 'revoked');
create type public.report_target as enum ('listing', 'conversation', 'user');
create type public.report_status as enum ('open', 'resolved', 'dismissed');

-- ---------------------------------------------------------------------------
-- People
-- ---------------------------------------------------------------------------

-- Public-facing: first name only.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 40),
  role public.user_role not null default 'renter',
  created_at timestamptz not null default now()
);

-- Private: owner and admin only. Phone numbers are never collected.
create table public.private_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text not null,
  language text not null default 'en' check (language in ('en', 'am')),
  banned boolean not null default false
);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 5 and 100),
  description text not null check (char_length(description) between 20 and 4000),
  type public.listing_type not null,
  price integer not null check (price between 1 and 100000),
  deposit integer not null default 0 check (deposit between 0 and 100000),
  bedrooms smallint not null check (bedrooms between 0 and 20),
  bathrooms numeric(3, 1) not null check (bathrooms between 0 and 20),
  city text not null,
  neighborhood text not null check (char_length(neighborhood) between 2 and 60),
  -- Deliberately blurred map point (about 1 km grid). Set only by the database from
  -- listing_addresses; hosts can't write it.
  approx_lat double precision,
  approx_lng double precision,
  available_from date not null,
  utilities_included boolean not null default false,
  parking boolean not null default false,
  pets_allowed boolean not null default false,
  status public.listing_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_created_idx on public.listings (status, created_at desc);
create index listings_host_idx on public.listings (host_id);

create table public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  path text not null,
  "order" smallint not null default 0,
  unique (listing_id, "order")
);

-- Private: exact location. Readable by the host, the admin, and renters the host approved.
create table public.listing_addresses (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  street_address text not null,
  unit text,
  zip text not null check (zip ~ '^\d{5}$'),
  exact_lat double precision not null check (exact_lat between 39.3 and 40.3),
  exact_lng double precision not null check (exact_lng between -105.5 and -104.3)
);

create table public.address_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  status public.address_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, renter_id)
);

create index address_requests_renter_idx on public.address_requests (renter_id);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  renter_id uuid not null references public.profiles (id) on delete cascade,
  host_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, renter_id),
  check (renter_id <> host_id)
);

create index conversations_renter_idx on public.conversations (renter_id);
create index conversations_host_idx on public.conversations (host_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_sender_created_idx on public.messages (sender_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Favorites and reports
-- ---------------------------------------------------------------------------

create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type public.report_target not null,
  target_id uuid not null,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 1000),
  status public.report_status not null default 'open',
  created_at timestamptz not null default now()
);

create index reports_target_idx on public.reports (target_type, target_id);

-- ---------------------------------------------------------------------------
-- Helper functions (security definer so policies can call them without recursion)
-- ---------------------------------------------------------------------------

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create function private.is_banned() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select banned from public.private_profiles where user_id = (select auth.uid())),
    false
  );
$$;

-- True for real end users. Seeds, migrations and the server's service key are trusted.
create function private.is_end_user() returns boolean
language sql stable set search_path = '' as $$
  select coalesce((select auth.jwt() ->> 'role'), '') in ('anon', 'authenticated');
$$;

create function private.is_conversation_member(conversation uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations
    where id = conversation and (select auth.uid()) in (renter_id, host_id)
  );
$$;

-- True if the current user and `person` have a conversation together.
create function private.shares_conversation(person uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.conversations
    where (renter_id = (select auth.uid()) and host_id = person)
       or (host_id = (select auth.uid()) and renter_id = person)
  );
$$;

-- Admins may read a conversation only after someone reports it.
create function private.is_reported_conversation(conversation uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.reports
    where target_type = 'conversation' and target_id = conversation
  );
$$;

create function private.has_address_access(listing uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.address_requests
    where listing_id = listing and renter_id = (select auth.uid()) and status = 'approved'
  );
$$;

revoke execute on all functions in schema private from public;
grant execute on all functions in schema private to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- New sign-up: public profile with first name only, email kept in the private table.
create function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  full_name text := coalesce(
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name'
  );
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(left(split_part(trim(full_name), ' ', 1), 40), ''));

  insert into public.private_profiles (user_id, email)
  values (new.id, new.email);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Keep the private email in sync if the user changes it.
create function private.handle_user_email_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.private_profiles set email = new.email where user_id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function private.handle_user_email_change();

-- Posting a first listing makes the user a host.
create function private.promote_to_host() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.profiles set role = 'host' where id = new.host_id and role = 'renter';
  return new;
end;
$$;

create trigger listings_promote_host
  after insert on public.listings
  for each row execute function private.promote_to_host();

-- Hosts can't approve their own listings. Any content edit sends the listing back
-- to review. Admin decisions are timestamped.
create function private.listings_before_update() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();

  if not private.is_end_user() or private.is_admin() then
    if new.status is distinct from old.status and new.status in ('active', 'rejected') then
      new.reviewed_at := now();
    end if;
    return new;
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

create trigger listings_before_update
  before update on public.listings
  for each row execute function private.listings_before_update();

-- Blur the exact location onto the public listing: snap to a 0.01° grid (~1 km).
-- Rounding (not random jitter) so repeated edits can't be averaged back to the real spot.
create function private.sync_approx_location() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update public.listings
  set approx_lat = round(new.exact_lat::numeric, 2),
      approx_lng = round(new.exact_lng::numeric, 2)
  where id = new.listing_id;
  return new;
end;
$$;

create trigger listing_addresses_sync_approx
  after insert or update of exact_lat, exact_lng on public.listing_addresses
  for each row execute function private.sync_approx_location();

-- Photo changes also go back to review.
create function private.photos_require_review() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target uuid := coalesce(new.listing_id, old.listing_id);
begin
  if private.is_end_user() and not private.is_admin() then
    update public.listings set status = 'pending', reviewed_at = null
    where id = target and status in ('active', 'rented');
  end if;
  return null;
end;
$$;

create trigger listing_photos_require_review
  after insert or update or delete on public.listing_photos
  for each row execute function private.photos_require_review();

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger address_requests_touch
  before update on public.address_requests
  for each row execute function private.touch_updated_at();

-- Rate limits against spam and scam bursts.
create function private.rate_limit_listings() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_end_user() and (
    select count(*) from public.listings
    where host_id = new.host_id and created_at > now() - interval '1 day'
  ) >= 5 then
    raise exception 'Too many new listings today. Please try again tomorrow.';
  end if;
  return new;
end;
$$;

create trigger listings_rate_limit
  before insert on public.listings
  for each row execute function private.rate_limit_listings();

create function private.rate_limit_messages() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_end_user() and (
    select count(*) from public.messages
    where sender_id = new.sender_id and created_at > now() - interval '1 minute'
  ) >= 15 then
    raise exception 'You are sending messages too quickly. Please wait a minute.';
  end if;
  return new;
end;
$$;

create trigger messages_rate_limit
  before insert on public.messages
  for each row execute function private.rate_limit_messages();

create function private.rate_limit_conversations() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if private.is_end_user() and (
    select count(*) from public.conversations
    where renter_id = new.renter_id and created_at > now() - interval '1 day'
  ) >= 20 then
    raise exception 'Too many new conversations today. Please try again tomorrow.';
  end if;
  return new;
end;
$$;

create trigger conversations_rate_limit
  before insert on public.conversations
  for each row execute function private.rate_limit_conversations();

-- ---------------------------------------------------------------------------
-- Privileges: revoke Supabase's defaults, then grant only what each role needs.
-- ---------------------------------------------------------------------------

revoke all on all tables in schema public from anon, authenticated;

grant select on public.listings, public.listing_photos, public.profiles to anon;

grant select on all tables in schema public to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant update (language) on public.private_profiles to authenticated;
grant insert (
  host_id, title, description, type, price, deposit, bedrooms, bathrooms, city,
  neighborhood, available_from, utilities_included, parking, pets_allowed
) on public.listings to authenticated;
grant update (
  title, description, type, price, deposit, bedrooms, bathrooms, city, neighborhood,
  available_from, utilities_included, parking, pets_allowed, status
) on public.listings to authenticated;
grant delete on public.listings to authenticated;
grant insert, update, delete on public.listing_photos to authenticated;
grant insert, update, delete on public.listing_addresses to authenticated;
grant insert (listing_id, renter_id) on public.address_requests to authenticated;
grant update (status) on public.address_requests to authenticated;
grant insert (listing_id, renter_id, host_id) on public.conversations to authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;
grant insert, delete on public.favorites to authenticated;
grant insert (target_type, target_id, reporter_id, reason) on public.reports to authenticated;
grant update (status) on public.reports to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.private_profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.listing_addresses enable row level security;
alter table public.address_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- profiles: a first name is visible for hosts with a live listing, to yourself, to
-- people you're talking with, and to the admin. Renters' names are not public.
create policy "profiles: visible when relevant" on public.profiles
  for select using (
    id = (select auth.uid())
    or exists (select 1 from public.listings l where l.host_id = profiles.id and l.status = 'active')
    or private.shares_conversation(id)
    or (select private.is_admin())
  );

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- private_profiles: owner and admin only.
create policy "private_profiles: read own or admin" on public.private_profiles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select private.is_admin()));

create policy "private_profiles: update own" on public.private_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- listings: the public sees only approved listings.
create policy "listings: active, own, or admin" on public.listings
  for select using (
    status = 'active'
    or host_id = (select auth.uid())
    or (select private.is_admin())
  );

create policy "listings: hosts create pending listings" on public.listings
  for insert to authenticated
  with check (
    host_id = (select auth.uid())
    and status = 'pending'
    and not (select private.is_banned())
  );

create policy "listings: host or admin updates" on public.listings
  for update to authenticated
  using (host_id = (select auth.uid()) or (select private.is_admin()))
  with check (
    (host_id = (select auth.uid()) and not (select private.is_banned()))
    or (select private.is_admin())
  );

create policy "listings: host or admin deletes" on public.listings
  for delete to authenticated
  using (host_id = (select auth.uid()) or (select private.is_admin()));

-- listing_photos: visible exactly when the listing is (listings RLS applies inside).
create policy "listing_photos: follow listing visibility" on public.listing_photos
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id)
  );

create policy "listing_photos: host manages" on public.listing_photos
  for all to authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
    and not (select private.is_banned())
  );

-- listing_addresses: host, admin, and renters with an approved request.
create policy "listing_addresses: host, approved renter, admin" on public.listing_addresses
  for select to authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
    or private.has_address_access(listing_id)
    or (select private.is_admin())
  );

create policy "listing_addresses: host manages" on public.listing_addresses
  for all to authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
    and not (select private.is_banned())
  );

-- address_requests: the renter asks; only the host decides.
create policy "address_requests: renter, host, admin read" on public.address_requests
  for select to authenticated
  using (
    renter_id = (select auth.uid())
    or exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
    or (select private.is_admin())
  );

create policy "address_requests: renter asks about an active listing" on public.address_requests
  for insert to authenticated
  with check (
    renter_id = (select auth.uid())
    and status = 'pending'
    and not (select private.is_banned())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active' and l.host_id <> (select auth.uid())
    )
  );

create policy "address_requests: host decides" on public.address_requests
  for update to authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
  )
  with check (
    status in ('approved', 'declined', 'revoked')
    and exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
  );

-- conversations: participants only; admin only once reported.
create policy "conversations: members, or admin when reported" on public.conversations
  for select to authenticated
  using (
    (select auth.uid()) in (renter_id, host_id)
    or ((select private.is_admin()) and private.is_reported_conversation(id))
  );

create policy "conversations: renter starts about an active listing" on public.conversations
  for insert to authenticated
  with check (
    renter_id = (select auth.uid())
    and not (select private.is_banned())
    and exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'active' and l.host_id = conversations.host_id
    )
  );

-- messages: same visibility as the conversation.
create policy "messages: members, or admin when reported" on public.messages
  for select to authenticated
  using (
    private.is_conversation_member(conversation_id)
    or ((select private.is_admin()) and private.is_reported_conversation(conversation_id))
  );

create policy "messages: members send as themselves" on public.messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and not (select private.is_banned())
    and private.is_conversation_member(conversation_id)
  );

create policy "messages: recipient marks read" on public.messages
  for update to authenticated
  using (sender_id <> (select auth.uid()) and private.is_conversation_member(conversation_id))
  with check (sender_id <> (select auth.uid()) and private.is_conversation_member(conversation_id));

-- favorites: your own only.
create policy "favorites: own" on public.favorites
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- reports: anyone signed in can report; only the admin reviews.
create policy "reports: reporter or admin read" on public.reports
  for select to authenticated
  using (reporter_id = (select auth.uid()) or (select private.is_admin()));

create policy "reports: file as yourself" on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open');

create policy "reports: admin updates" on public.reports
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
