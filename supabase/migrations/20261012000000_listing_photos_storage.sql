-- Listing photos: private storage bucket, and rules tying each photo to its listing.
--
-- Photos are uploaded from the browser to `<host id>/<listing id>/<file>.jpg` before the
-- listing row exists, so the client picks the listing id up front.

-- Hosts choose the listing id so photos can be uploaded into its folder first.
grant insert (id) on public.listings to authenticated;

-- A photo row must point into the host's own folder for that listing.
drop policy "listing_photos: host manages" on public.listing_photos;
create policy "listing_photos: host manages" on public.listing_photos
  for all to authenticated
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.listings l where l.id = listing_id and l.host_id = (select auth.uid()))
    and path like (select auth.uid())::text || '/' || listing_id::text || '/%'
    and not (select private.is_banned())
  );

-- Private bucket: files are reachable only through short-lived signed links, and the
-- rules below decide who may create one. JPEG only (the browser re-encodes every photo,
-- which also removes GPS location data); 5 MB cap.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-photos', 'listing-photos', false, 5242880, array['image/jpeg']);

-- Upload only into your own folder, and not while banned.
create policy "listing-photos: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and not (select private.is_banned())
  );

-- See a photo if you uploaded it, or if its listing is visible to you (approved
-- listings for everyone; listing_photos' own rules apply inside the subquery).
create policy "listing-photos: read own or visible listing" on storage.objects
  for select
  using (
    bucket_id = 'listing-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or exists (select 1 from public.listing_photos p where p.path = objects.name)
    )
  );

create policy "listing-photos: delete own" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'listing-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create index listing_photos_path_idx on public.listing_photos (path);
