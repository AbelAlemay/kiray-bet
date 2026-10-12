-- Admin moderation: ban and unban users, and remove any listing's photos.

-- Only the admin may change `banned` (users can still change their own language).
grant update (banned) on public.private_profiles to authenticated;

create policy "private_profiles: admin updates" on public.private_profiles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create function private.guard_banned() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.banned is distinct from old.banned and private.is_end_user() and not private.is_admin() then
    raise exception 'Only an admin can ban or unban accounts';
  end if;
  return new;
end;
$$;

create trigger private_profiles_guard_banned
  before update on public.private_profiles
  for each row execute function private.guard_banned();

-- The admin can see and delete any listing's photos (when removing a listing).
create policy "listing-photos: admin reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'listing-photos' and (select private.is_admin()));

create policy "listing-photos: admin deletes" on storage.objects
  for delete to authenticated
  using (bucket_id = 'listing-photos' and (select private.is_admin()));

grant execute on all functions in schema private to anon, authenticated, service_role;
