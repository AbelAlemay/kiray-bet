-- Utilities are now always included in the rent, so hosts tick amenities instead.
-- The utilities columns stay for older rows but the site no longer writes or shows them.
alter table public.listings
  add column amenities text[] not null default '{}'
    check (amenities <@ array[
      'wifi', 'furnished', 'washer_dryer', 'shared_laundry', 'ac', 'private_bath',
      'private_entrance', 'own_kitchen', 'dishwasher', 'yard', 'storage', 'near_transit'
    ]::text[]);

grant insert (amenities) on public.listings to authenticated;
grant update (amenities) on public.listings to authenticated;

-- Internet was a utility; it is now the Wi-Fi amenity.
update public.listings set amenities = array['wifi'] where 'internet' = any(utilities);
