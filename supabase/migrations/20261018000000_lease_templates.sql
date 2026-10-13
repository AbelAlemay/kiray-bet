-- Lease agreement templates, one series per home type. The default drafts ship with the
-- app (src/lib/leases/templates); each time the admin saves an edited version (e.g. the
-- attorney's text) it is stored here as a new version. Versions are never changed or
-- deleted, so it's always clear which text a lease was generated from.

create table public.lease_templates (
  id uuid primary key default gen_random_uuid(),
  listing_type public.listing_type not null,
  version integer not null check (version >= 1),
  body text not null check (char_length(body) between 100 and 100000),
  lawyer_reviewed boolean not null default false,
  -- e.g. "Reviewed by Jane Doe, Esq., Nov 2026"
  review_note text check (char_length(review_note) <= 300),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (listing_type, version)
);

alter table public.lease_templates enable row level security;

-- Signed-in users (hosts) read templates to generate leases; only the admin adds versions.
-- (New tables get Supabase's default "grant all"; take it back first.)
revoke all on public.lease_templates from anon, authenticated;
grant select on public.lease_templates to authenticated;
grant insert (listing_type, version, body, lawyer_reviewed, review_note, created_by)
  on public.lease_templates to authenticated;

create policy "lease_templates: signed-in users read" on public.lease_templates
  for select to authenticated using (true);

create policy "lease_templates: admin adds versions" on public.lease_templates
  for insert to authenticated
  with check ((select private.is_admin()) and created_by = (select auth.uid()));
