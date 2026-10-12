-- The server's admin key (service_role) runs the same triggers as everyone else
-- (review rules, rate limits), so it needs the helper functions too.
grant usage on schema private to service_role;
grant execute on all functions in schema private to service_role;
