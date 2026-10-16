-- The visit counter is callable by anyone (it counts anonymous visitors). Cap new
-- visitors per day so a script inventing visitor ids can't fill the table.
create or replace function public.record_visit(visitor uuid) returns void
language sql security definer set search_path = '' as $$
  insert into private.page_views (day, visitor)
  select (now() at time zone 'America/Denver')::date, visitor
  where exists (
      select 1 from private.page_views
      where day = (now() at time zone 'America/Denver')::date and page_views.visitor = record_visit.visitor
    )
    or (select count(*) from private.page_views where day = (now() at time zone 'America/Denver')::date) < 20000
  on conflict (day, visitor) do update
    set views = least(private.page_views.views + 1, 1000);
$$;
