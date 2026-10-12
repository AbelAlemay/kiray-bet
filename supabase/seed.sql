-- Sample data for development: the six listings from src/lib/sample-listings.ts.
-- Hosts are fake users at example.com; addresses are made up. Remove before launch.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
  lower(first_name) || '@example.com', '', now(),
  '{"provider":"email","providers":["email"]}', jsonb_build_object('first_name', first_name),
  now(), now()
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid, 'Dawit'),
  ('a0000000-0000-4000-8000-000000000002'::uuid, 'Selam'),
  ('a0000000-0000-4000-8000-000000000003'::uuid, 'Meron'),
  ('a0000000-0000-4000-8000-000000000004'::uuid, 'Yonas'),
  ('a0000000-0000-4000-8000-000000000005'::uuid, 'Hanna'),
  ('a0000000-0000-4000-8000-000000000006'::uuid, 'Tesfaye')
) as hosts (id, first_name);

insert into public.listings (
  id, host_id, title, type, price, deposit, bedrooms, bathrooms, city, neighborhood,
  available_from, utilities_included, parking, pets_allowed, description, status,
  reviewed_at, created_at
) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   'Bright 3-bed house near Havana St', 'house', 2450, 2450, 3, 2, 'Aurora', 'Del Mar',
   '2026-11-01', false, true, false,
   'Sunny house on a quiet street, a short walk from Havana St shops, restaurants and the bus line. Updated kitchen, washer and dryer, fenced yard and a two-car driveway.',
   'active', '2026-10-08', '2026-10-08'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002',
   'Private basement unit with own entrance', 'basement', 1150, 800, 1, 1, 'Aurora', 'Mission Viejo',
   '2026-10-20', true, true, false,
   'Fully separate basement with its own entrance, kitchenette and bathroom. Utilities and Wi-Fi are included. Off-street parking for one car.',
   'active', '2026-10-09', '2026-10-09'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003',
   'Furnished room, quiet household', 'room', 750, 400, 1, 1, 'Denver', 'Montbello',
   '2026-10-15', true, false, false,
   'Furnished bedroom in a calm, clean home. Shared kitchen and bathroom. Utilities and internet included. Close to the bus to downtown and DIA.',
   'active', '2026-10-10', '2026-10-10'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000004',
   '2-bed apartment close to light rail', 'apartment', 1750, 1750, 2, 1, 'Lakewood', 'Belmar',
   '2026-12-01', false, true, true,
   'Second-floor apartment, a 5-minute walk to the W line light rail. In-unit laundry, one assigned parking spot and a small balcony.',
   'active', '2026-10-05', '2026-10-05'),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000005',
   'Family home with big backyard', 'house', 2900, 2900, 4, 3, 'Centennial', 'Willow Creek',
   '2026-11-15', false, true, true,
   'Spacious family home in a good school district. Large backyard, finished basement, attached garage and central air.',
   'active', '2026-10-03', '2026-10-03'),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000006',
   'Cozy studio-style basement', 'basement', 950, 600, 1, 1, 'Englewood', 'Cherry Hills',
   '2026-10-25', true, false, false,
   'Open-plan basement studio with its own bathroom and small kitchen. Utilities included. Street parking only.',
   'active', '2026-10-07', '2026-10-07');

-- Fake addresses; the trigger copies a blurred point onto each listing.
insert into public.listing_addresses (listing_id, street_address, zip, exact_lat, exact_lng) values
  ('b0000000-0000-4000-8000-000000000001', '100 Sample St', '80012', 39.71482, -104.86391),
  ('b0000000-0000-4000-8000-000000000002', '200 Sample St', '80016', 39.63817, -104.80264),
  ('b0000000-0000-4000-8000-000000000003', '300 Sample St', '80239', 39.78126, -104.83472),
  ('b0000000-0000-4000-8000-000000000004', '400 Sample St', '80226', 39.70563, -105.08118),
  ('b0000000-0000-4000-8000-000000000005', '500 Sample St', '80122', 39.58594, -104.88327),
  ('b0000000-0000-4000-8000-000000000006', '600 Sample St', '80113', 39.64135, -104.96012);
