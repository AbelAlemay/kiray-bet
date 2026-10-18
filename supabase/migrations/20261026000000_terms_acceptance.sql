-- Records when each person ticked "I agree to the Terms of Service and Privacy Policy",
-- and which version of the Terms (its "last updated" date) they agreed to.
alter table public.private_profiles
  add column terms_accepted_at timestamptz,
  add column terms_version text check (char_length(terms_version) <= 40);

-- Only through this function, so the time is always the server's and nobody can set it
-- for someone else.
create function public.accept_terms(version text) returns void
language sql
security definer
set search_path = ''
as $$
  update public.private_profiles
     set terms_accepted_at = now(), terms_version = left(version, 40)
   where user_id = auth.uid();
$$;

revoke execute on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated;
