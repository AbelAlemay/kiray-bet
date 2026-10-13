-- Privacy-friendly visit counting for the admin dashboard.
--
-- The browser keeps a random visitor id in a first-party cookie (no IP address, no
-- third parties) and reports each page view. Counts live in the private schema,
-- which the API doesn't expose; only the two functions below touch them.

create table private.page_views (
  day date not null,
  visitor uuid not null,
  views integer not null default 1,
  primary key (day, visitor)
);
revoke all on private.page_views from anon, authenticated;

-- Called by every visitor's browser (anonymous allowed). Days are Denver days.
create function public.record_visit(visitor uuid) returns void
language sql security definer set search_path = '' as $$
  insert into private.page_views (day, visitor)
  values ((now() at time zone 'America/Denver')::date, visitor)
  on conflict (day, visitor) do update
    set views = least(private.page_views.views + 1, 1000);
$$;

revoke execute on function public.record_visit(uuid) from public;
grant execute on function public.record_visit(uuid) to anon, authenticated;

-- Daily totals for the admin page: unique visitors, page views, sign-ups, new listings.
create function public.admin_daily_stats(days integer default 30)
returns table (day date, visitors integer, page_views integer, signups integer, listings integer)
language plpgsql stable security definer set search_path = '' as $$
declare
  today date := (now() at time zone 'America/Denver')::date;
begin
  if not private.is_admin() then
    raise exception 'Admins only';
  end if;
  return query
    with d as (
      select generate_series(today - (least(greatest(days, 1), 366) - 1), today, interval '1 day')::date as day
    )
    select
      d.day,
      (select count(*)::integer from private.page_views v where v.day = d.day),
      (select coalesce(sum(v.views), 0)::integer from private.page_views v where v.day = d.day),
      (select count(*)::integer from public.profiles p
        where (p.created_at at time zone 'America/Denver')::date = d.day),
      (select count(*)::integer from public.listings l
        where (l.created_at at time zone 'America/Denver')::date = d.day)
    from d
    order by d.day;
end;
$$;

revoke execute on function public.admin_daily_stats(integer) from public, anon;
grant execute on function public.admin_daily_stats(integer) to authenticated;
