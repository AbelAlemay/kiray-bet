-- Reporting listings and conversations (phase 9).
--  * A reason category alongside the free text.
--  * One open report per person per target (no duplicates from double taps).
--  * At most 20 reports a day per person, and none while banned.
--  * Reports can be filed only about things the reporter can see: a live listing, or
--    a conversation they're part of (filing one lets the admin read it).

alter table public.reports
  add column category text not null default 'other'
    check (category in ('scam', 'fake', 'discrimination', 'offensive', 'wrong_info', 'other'));
grant insert (category) on public.reports to authenticated;

create unique index reports_one_open_per_reporter
  on public.reports (reporter_id, target_type, target_id) where status = 'open';

create function private.check_report() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_end_user() or private.is_admin() then
    return new;
  end if;
  if private.is_banned() then
    raise exception 'Banned users cannot file reports';
  end if;
  if (select count(*) from public.reports
      where reporter_id = new.reporter_id and created_at > now() - interval '1 day') >= 20 then
    raise exception 'Too many reports today. Please try again tomorrow.';
  end if;
  if new.target_type = 'listing' and not exists (
      select 1 from public.listings where id = new.target_id and status = 'active') then
    raise exception 'That listing is not available';
  end if;
  if new.target_type = 'conversation' and not exists (
      select 1 from public.conversations
      where id = new.target_id and (renter_id = new.reporter_id or host_id = new.reporter_id)) then
    raise exception 'You can only report your own conversations';
  end if;
  if new.target_type = 'user' and not private.shares_conversation(new.target_id) then
    raise exception 'You can only report people you have talked with';
  end if;
  return new;
end;
$$;

create trigger reports_check
  before insert on public.reports
  for each row execute function private.check_report();
