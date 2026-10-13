import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";

// Security-rule tests for the database. Runs the real migrations and seed in an
// in-memory Postgres (PGlite) with a small stand-in for Supabase's auth schema,
// then acts as different users. No Docker needed: `npm run test:db`.

const dir = new URL("..", import.meta.url).pathname;
const db = new PGlite();

// Minimal stand-in for what Supabase provides.
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  create schema auth; grant usage on schema auth to anon, authenticated, service_role;
  create table auth.users (id uuid primary key, instance_id uuid, aud text, role text, email text,
    encrypted_password text, email_confirmed_at timestamptz, raw_app_meta_data jsonb,
    raw_user_meta_data jsonb, created_at timestamptz, updated_at timestamptz);
  create function auth.jwt() returns jsonb language sql stable as
    $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), 'null')::jsonb $$;
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
  create schema storage; grant usage on schema storage to anon, authenticated;
  create table storage.buckets (id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets, name text, owner uuid default auth.uid());
  grant select, insert, delete on storage.objects to anon, authenticated;
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as
    $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
`);
for (const file of readdirSync(`${dir}migrations`).sort()) {
  await db.exec(readFileSync(`${dir}migrations/${file}`, "utf8"));
}
await db.exec(readFileSync(`${dir}seed.sql`, "utf8"));

let failures = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${ok ? "" : "  " + detail}`);
};

// Run SQL as a given user (null = anonymous visitor, SERVER = the server's admin key).
const SERVER = "service_role";
// Signed-in users are "aal2" (confirmed with an authenticator app) unless `aal` says otherwise.
async function as(uid, sql, params = [], { aal = "aal2" } = {}) {
  const role = uid === SERVER ? "service_role" : uid ? "authenticated" : "anon";
  const claims = uid && uid !== SERVER ? { sub: uid, role, aal } : { role };
  return db.transaction(async (tx) => {
    await tx.exec(`set local role ${role}`);
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    return (await tx.query(sql, params)).rows;
  });
}
async function fails(uid, sql, params, opts) {
  try { await as(uid, sql, params, opts); return false; } catch { return true; }
}
async function newUser(id, name) {
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)`,
    [id, `${name.toLowerCase()}@test.com`, { full_name: `${name} Lastname` }]);
}

const DAWIT = "a0000000-0000-4000-8000-000000000001";
const L1 = "b0000000-0000-4000-8000-000000000001";
const RUTH = "c0000000-0000-4000-8000-000000000001";
const SAMI = "c0000000-0000-4000-8000-000000000002";
const ADMIN = "c0000000-0000-4000-8000-000000000003";
await newUser(RUTH, "Ruth");
await newUser(SAMI, "Sami");
await newUser(ADMIN, "Admin");
await db.query(`update public.profiles set role = 'admin' where id = $1`, [ADMIN]);

// Public visitor
let rows = await as(null, `select id, status, approx_lat, approx_lng from listings`);
check("anon sees 6 active seed listings", rows.length === 6 && rows.every((r) => r.status === "active"));
check("seed listing has blurred location", rows.find((r) => r.id === L1)?.approx_lat === 39.71);
check("anon can't read addresses", await fails(null, `select * from listing_addresses`));
check("anon can't read emails", await fails(null, `select * from private_profiles`));
rows = await as(null, `select display_name from profiles`);
check("anon sees only host first names", rows.length === 6 && rows.every((r) => !r.display_name.includes(" ")));
check("anon can't insert listings", await fails(null,
  `insert into listings (host_id, title, description, type, price, bedrooms, bathrooms, city, neighborhood, available_from) values ($1,'x','x','room',1,1,1,'Denver','x','2026-11-01')`, [DAWIT]));

// Renter account
rows = await as(RUTH, `select display_name, role from profiles where id = $1`, [RUTH]);
check("sign-up stores first name only, role renter", rows[0]?.display_name === "Ruth" && rows[0]?.role === "renter");
rows = await as(RUTH, `select user_id from private_profiles`);
check("user sees only own private profile", rows.length === 1 && rows[0].user_id === RUTH);
check("user can't make self admin", await fails(RUTH, `update profiles set role = 'admin' where id = $1`, [RUTH]));
check("user can't ban/unban self", await fails(RUTH, `update private_profiles set banned = true where user_id = $1`, [RUTH]));

// Hosting flow
const insertListing = `insert into listings (host_id, title, description, type, price, bedrooms, bathrooms, city, neighborhood, available_from)
  values ($1, 'Nice room in Aurora', 'A quiet furnished room close to the bus line.', 'room', 800, 1, 1, 'Aurora', 'Del Mar', '2026-11-01') returning id, status`;
check("can't post as someone else", await fails(RUTH, insertListing, [DAWIT]));
check("can't post already-active listing", await fails(RUTH,
  `insert into listings (host_id, title, description, type, price, bedrooms, bathrooms, city, neighborhood, available_from, status) values ($1,'Nice room','A quiet furnished room close to bus.','room',1,1,1,'Denver','xx','2026-11-01','active')`, [RUTH]));
rows = await as(RUTH, insertListing, [RUTH]);
const RL = rows[0].id;
check("new listing is pending", rows[0].status === "pending");
check("posting makes user a host", (await as(RUTH, `select role from profiles where id = $1`, [RUTH]))[0].role === "host");
check("anon can't see pending listing", (await as(null, `select 1 from listings where id = $1`, [RL])).length === 0);
check("host can't approve own listing", await fails(RUTH, `update listings set status = 'active' where id = $1`, [RL]));
check("host can't set approx location", await fails(RUTH, `update listings set approx_lat = 1 where id = $1`, [RL]));

check("admin without two-step login can't approve", (await as(ADMIN,
  `update listings set status = 'active' where id = $1 returning id`, [RL], { aal: "aal1" })).length === 0);
rows = await as(ADMIN, `update listings set status = 'active' where id = $1 returning status, reviewed_at`, [RL]);
check("admin approves, reviewed_at set", rows[0].status === "active" && rows[0].reviewed_at);
rows = await as(RUTH, `update listings set status = 'rented' where id = $1 returning status`, [RL]);
check("host can mark rented", rows[0].status === "rented");
await as(RUTH, `update listings set status = 'active' where id = $1`, [RL]);
rows = await as(RUTH, `update listings set price = 900 where id = $1 returning status`, [RL]);
check("price edit goes back to review", rows[0].status === "pending");
await as(ADMIN, `update listings set status = 'active' where id = $1`, [RL]);
await as(RUTH, `insert into listing_addresses (listing_id, street_address, zip, exact_lat, exact_lng) values ($1, '1 Test St', '80012', 39.7, -104.8)`, [RL]);
rows = await as(RUTH, `select status, approx_lat from listings where id = $1`, [RL]);
check("address added: blurred + back to review", rows[0].status === "pending" && rows[0].approx_lat === 39.7);
await as(ADMIN, `update listings set status = 'active' where id = $1`, [RL]);
const photo = `${RUTH}/${RL}/1.jpg`;
check("can't upload into someone else's folder", await fails(SAMI,
  `insert into storage.objects (bucket_id, name) values ('listing-photos', $1)`, [photo]));
await as(RUTH, `insert into storage.objects (bucket_id, name) values ('listing-photos', $1)`, [photo]);
check("photo row must point into own listing folder", await fails(RUTH,
  `insert into listing_photos (listing_id, path) values ($1, $2)`, [RL, `${SAMI}/${RL}/1.jpg`]));
await as(RUTH, `insert into listing_photos (listing_id, path) values ($1, $2)`, [RL, photo]);
check("photo added goes back to review", (await as(RUTH, `select status from listings where id = $1`, [RL]))[0].status === "pending");
const seePhoto = (uid) => as(uid, `select 1 from storage.objects where name = $1`, [photo]);
check("public can't see photos of a pending listing", (await seePhoto(null)).length === 0);
check("host sees own pending photo", (await seePhoto(RUTH)).length === 1);
await as(ADMIN, `update listings set status = 'active' where id = $1`, [RL]);
check("public sees photos once approved", (await seePhoto(null)).length === 1);
check("others can't delete a host's photo", (await as(SAMI, `delete from storage.objects where name = $1 returning id`, [photo])).length === 0);
await as(RUTH, `insert into storage.objects (bucket_id, name) values ('listing-photos', $1)`, [`${RUTH}/${RL}/2.jpg`]);
check("admin can delete a host's photo", (await as(ADMIN, `delete from storage.objects where name = $1 returning id`, [`${RUTH}/${RL}/2.jpg`])).length === 1);
await as(RUTH, `update listings set price = 950 where id = $1`, [RL]);
check("photos hidden again while edit is reviewed", (await seePhoto(null)).length === 0);
check("other user can't edit listing", (await as(SAMI, `update listings set price = 1 where id = $1 returning id`, [L1])).length === 0);

// Messaging
check("can't start conversation with wrong host", await fails(SAMI,
  `insert into conversations (listing_id, renter_id, host_id) values ($1, $2, $3)`, [L1, SAMI, RUTH]));
rows = await as(SAMI, `insert into conversations (listing_id, renter_id, host_id) values ($1, $2, $3) returning id`, [L1, SAMI, DAWIT]);
const C = rows[0].id;
await as(SAMI, `insert into messages (conversation_id, sender_id, body) values ($1, $2, 'Hi, is it still available?')`, [C, SAMI]);
check("host reads message", (await as(DAWIT, `select body from messages`)).length === 1);
check("outsider can't read message", (await as(RUTH, `select body from messages`)).length === 0);
check("outsider can't post into conversation", await fails(RUTH,
  `insert into messages (conversation_id, sender_id, body) values ($1, $2, 'spam')`, [C, RUTH]));
check("can't send as someone else", await fails(SAMI,
  `insert into messages (conversation_id, sender_id, body) values ($1, $2, 'x')`, [C, DAWIT]));
check("host sees renter's first name", (await as(DAWIT, `select 1 from profiles where id = $1`, [SAMI])).length === 1);
check("admin can't read unreported chat", (await as(ADMIN, `select 1 from messages`)).length === 0);
await as(SAMI, `insert into reports (target_type, target_id, reporter_id, reason) values ('conversation', $1, $2, 'Asked for deposit by Zelle')`, [C, SAMI]);
check("admin reads chat once reported", (await as(ADMIN, `select 1 from messages`)).length === 1);
check("admin without two-step login can't read reported chat",
  (await as(ADMIN, `select 1 from messages`, [], { aal: "aal1" })).length === 0);
check("sender can't mark own message read", (await as(SAMI, `update messages set read_at = now() returning id`)).length === 0);
check("recipient marks read", (await as(DAWIT, `update messages set read_at = now() returning id`)).length === 1);
check("can't edit message body", await fails(DAWIT, `update messages set body = 'x'`));

// Address requests
check("renter can't see address", (await as(SAMI, `select 1 from listing_addresses where listing_id = $1`, [L1])).length === 0);
rows = await as(SAMI, `insert into address_requests (listing_id, renter_id) values ($1, $2) returning id`, [L1, SAMI]);
const AR = rows[0].id;
check("renter can't approve own request", (await as(SAMI, `update address_requests set status = 'approved' where id = $1 returning id`, [AR])).length === 0);
await as(DAWIT, `update address_requests set status = 'approved' where id = $1`, [AR]);
check("approved renter sees address", (await as(SAMI, `select 1 from listing_addresses where listing_id = $1`, [L1])).length === 1);
await as(DAWIT, `update address_requests set status = 'revoked' where id = $1`, [AR]);
check("revoked renter loses address", (await as(SAMI, `select 1 from listing_addresses where listing_id = $1`, [L1])).length === 0);

// Review notes
check("host can't write a review note", await fails(RUTH, `update listings set review_note = 'ok' where id = $1`, [RL]));
rows = await as(ADMIN, `update listings set status = 'rejected', review_note = 'Photos are blurry' where id = $1 returning status`, [RL]);
check("admin rejects with a note", rows[0]?.status === "rejected");
check("host reads the note", (await as(RUTH, `select review_note from listings where id = $1`, [RL]))[0]?.review_note === "Photos are blurry");
rows = await as(RUTH, `update listings set description = 'Clear new photos, quiet room near the bus line.' where id = $1 returning status`, [RL]);
check("host edit resubmits a rejected listing", rows[0]?.status === "pending");

// Visit stats
const VISITOR = "d0000000-0000-4000-8000-000000000001";
await as(null, `select public.record_visit($1)`, [VISITOR]);
await as(null, `select public.record_visit($1)`, [VISITOR]);
await as(RUTH, `select public.record_visit($1)`, ["d0000000-0000-4000-8000-000000000002"]);
check("anyone can't read raw visit data", await fails(null, `select * from private.page_views`));
check("signed-in users can't read raw visit data", await fails(RUTH, `select * from private.page_views`));
check("non-admin can't read stats", await fails(RUTH, `select * from public.admin_daily_stats(7)`));
check("anon can't read stats", await fails(null, `select * from public.admin_daily_stats(7)`));
check("admin without two-step login can't read stats", await fails(ADMIN, `select * from public.admin_daily_stats(7)`, [], { aal: "aal1" }));
rows = await as(ADMIN, `select * from public.admin_daily_stats(7)`);
const todayStats = rows[rows.length - 1];
check("admin sees 7 days of stats", rows.length === 7);
check("unique visitors and page views counted", todayStats.visitors === 2 && todayStats.page_views === 3);
check("sign-ups counted", todayStats.signups >= 3);

// Server (admin key)
rows = await as(SERVER, `update listings set status = 'rejected' where id = $1 returning status, reviewed_at`, [RL]);
check("server key can review listings", rows[0]?.status === "rejected" && rows[0]?.reviewed_at);

// Bans
check("user can't ban someone else", (await as(RUTH, `update private_profiles set banned = true where user_id = $1 returning user_id`, [SAMI])).length === 0);
check("user can't ban/unban themselves", await fails(SAMI, `update private_profiles set banned = true where user_id = $1`, [SAMI]));
check("user can still change own language", (await as(SAMI, `update private_profiles set language = 'am' where user_id = $1 returning user_id`, [SAMI])).length === 1);
check("admin without two-step login can't ban", (await as(ADMIN, `update private_profiles set banned = true where user_id = $1 returning user_id`, [SAMI], { aal: "aal1" })).length === 0);
check("admin bans a user", (await as(ADMIN, `update private_profiles set banned = true where user_id = $1 returning user_id`, [SAMI])).length === 1);
check("banned user can't unban themselves", await fails(SAMI, `update private_profiles set banned = false where user_id = $1`, [SAMI]));
check("banned user can't message", await fails(SAMI,
  `insert into messages (conversation_id, sender_id, body) values ($1, $2, 'hi')`, [C, SAMI]));

// Rate limit
for (let i = 0; i < 4; i++) await as(RUTH, insertListing, [RUTH]);
check("6th listing in a day is blocked", await fails(RUTH, insertListing, [RUTH]));

console.log(failures ? `\n${failures} FAILED` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
