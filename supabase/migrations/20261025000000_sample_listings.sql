-- Sample listings: a few made-up homes per area that show visitors how KirayBet looks
-- before real hosts post. The site labels them "Sample", they're hidden from search
-- engines, and nobody can message their (fake) hosts. Only the admin sets the flag:
-- hosts get no insert or update grant on it.
alter table public.listings add column is_sample boolean not null default false;

update public.listings set is_sample = true where host_id::text like 'c1000000-%';

create function private.block_sample_contact() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.listings where id = new.listing_id and is_sample) then
    raise exception 'This is a sample listing, so there is no host to contact.';
  end if;
  return new;
end;
$$;

create trigger conversations_not_sample
  before insert on public.conversations
  for each row execute function private.block_sample_contact();

create trigger address_requests_not_sample
  before insert on public.address_requests
  for each row execute function private.block_sample_contact();
