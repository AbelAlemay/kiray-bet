# ኪራይ ቤት · KirayBet — Project Plan

A rental marketplace for the Habesha (Ethiopian & Eritrean) community in 11 U.S. metro
areas (Denver first; see the Area row). Hosts can list houses, apartments, basements and rooms. Renters can search and
message them, in English or Amharic.

**Our core promise: safe and private.** Personal information is never shown publicly,
every listing is reviewed by a person, and all contact happens inside the site.

## 1. Decisions made (Oct 11, 2026)
| Topic | Decision |
|---|---|
| Name | **KirayBet** (ኪራይ ቤት). kiraybet.com is taken (registered Apr 2025, no website); kiraybet.net and kiraybet.org are available. |
| Contact | **In-app messaging only.** Emails are never shown to other users. |
| Phone numbers | **Never collected.** We don't ask for them at all. |
| Listing approval | **Every listing is reviewed by the admin before it goes live.** Admin is notified of each new listing by **email and Telegram**. |
| Address privacy | Public sees only the nearest major intersection (e.g. "Near Havana & Iliff, Aurora", worked out from the blurred map point via OpenStreetMap) and an approximate map area. The exact address is shared only after the renter asks **and the host approves**. |
| Area | Denver at launch; since Oct 15, 2026 also DC/MD/VA, Seattle, Dallas–Fort Worth, Austin, Houston, Minneapolis–Saint Paul, Portland, Atlanta, SF Bay Area and Southern California. Areas are defined in src/lib/regions.ts and must match `private.region_for()` in the database; a listing's area is set by the database from its address. Visitors pick an area with the "Change" button at the top of the home page banner or above search results (remembered in a cookie, `?region=` in links). Each area has a skyline silhouette in the banner (src/components/Skyline.tsx). |
| Login | Email link + 6-digit code, and Google. Same flow signs up new users. |
| Language | English and Amharic side by side. Amharic font: **Menbere**. |
| Accounts | **Only hosts create full accounts.** Renters browse with no account and just confirm their email (email link or Google) when they tap "Contact host". No password, no profile. |
| Money | **No payments on the site, ever.** Warn users not to pay by Zelle, Cash App, Venmo or any other way before seeing the home and signing a lease. |
| Lease agreements | Proposed: hosts generate a lease from the site, both sides e-sign, signed copy stored. Under discussion; see section 4. |

## 2. Who uses it
- **Hosts** list a whole house, an apartment, a basement unit or a single room.
- **Renters** search, save favorites and message hosts.
- **Admin** approves or rejects listings, handles reports and bans scammers.

## 3. Security & privacy (top priority)
What we protect and how:

**Personal information**
- Phone numbers are never collected. Emails live in a private table that only the owner and the admin can
  read. Database security rules (Supabase Row Level Security) are on for every table, and no
  table is readable without a rule that allows it.
- Exact address and exact map position live in a separate private table. The public listing
  stores only the neighborhood and a deliberately blurred map point.
- Address requests: renter asks, host approves or declines, and only then can that renter
  read the address. The host can revoke access.
- Location data (GPS) is stripped from every uploaded photo, because phone photos can
  reveal the exact address.

**Messaging**
- Only the two people in a conversation (and the admin, when a conversation is reported) can
  read its messages.
- Messages are encrypted in transit (HTTPS) and at rest (Supabase disk encryption). They are
  not end-to-end encrypted, so we never claim that.
- Warnings in the chat when someone shares a phone number, link, or asks for money
  ("Never send a deposit before seeing the home").

**Stopping scammers**
- Email must be verified before a user can post or send messages.
- Bot protection (Cloudflare Turnstile) on sign-up and on posting.
- Rate limits on new messages and new listings.
- Every listing is reviewed before it goes live; edits to price, photos or address go back
  for review.
- "Report" button on every listing, conversation and profile; admin can ban users.

**Admin account and site**
- Admin account protected with two-factor login (Supabase MFA).
- Security headers (Content Security Policy, HTTPS-only), uploads checked for type and size.
- Secret keys only on the server, never in the browser.
- Dependencies kept up to date; security review before launch.

**Money**
- The site never processes payments. A payment warning appears on the home page, every
  listing and (later) in chat. Messages mentioning Zelle, Cash App, Venmo, wire transfers or
  gift cards trigger the warning automatically.

**Telling users**
- A "Safe & private" section on the home page and a full Safety page explaining exactly what
  we protect, plus scam-avoidance tips.
- Short privacy reminders where it matters: listing page, posting form, chat.
- Promises must be concrete and true ("we never show your phone number"), never absolute
  ("your data can never be stolen").

## 4. Lease agreements (v1 built Oct 2026)
**Built:** hosts tap 📄 Lease on My listings and get the agreement for their home type (house,
apartment, basement, room), pre-filled from the listing, to print or save as PDF. Nothing typed is
stored. Default drafts live in src/lib/leases/templates.ts with attorney notes ({{! … }}) that never
print. Admin → Leases edits each agreement; every save is a new version (lease_templates table), and
until one is marked "reviewed by a Colorado attorney" every lease shows a DRAFT warning.
**Next:** have a Colorado landlord-tenant attorney review all four and paste their versions;
later, e-signing and stored signed copies (proposal below).

### Original proposal
- Host fills in the terms (rent, deposit, dates, rules) from the listing; the renter fills in
  their own legal name. Both e-sign on the site, then a locked PDF is stored and both can
  download it.
- Template must be drafted or reviewed by a Colorado landlord-tenant lawyer. The site
  provides the form only; it is not a party and gives no legal advice.
- English version is the binding one; an Amharic version can be provided for reference.
- Leases hold the most sensitive data on the site, so they are readable only by the host and
  renter, stored in private storage, and deletable on request after a retention period.

## 5. MVP features (version 1)
1. Sign up / log in, profile (first name, preferred language)
2. Post, edit, delete a listing with photos; "My listings" page; mark as rented
3. Admin approval queue with an email and Telegram notification for each new listing
4. Browse and search with filters, plus a map with approximate locations
5. Listing detail page with photo gallery
6. In-app messaging between renter and host, with unread notifications by email
7. Address request and host approval
8. Saved / favorite listings
9. English and Amharic
10. Report listings, conversations and users; admin moderation and bans
11. Safety page, Terms of Service, Privacy Policy
12. Mobile-first design

## 6. Later (version 2+)
- Verified host badge (ID check)
- Roommate-finder posts ("looking for a room")
- Paid "featured" listings (Stripe)
- Alerts for new matching listings
- Reviews and ratings
- Mobile app (PWA first)
- Other cities

## 7. Tech stack
| Layer        | Choice                                             |
|--------------|----------------------------------------------------|
| Frontend     | Next.js 16 + TypeScript + Tailwind CSS              |
| Backend / DB | Supabase (Postgres, Auth, Storage, Realtime for chat) |
| Email        | Resend (admin notifications, new-message emails)    |
| Admin alerts | Telegram bot (new listings, reports)               |
| Bot defense  | Cloudflare Turnstile                                |
| Maps         | Leaflet + OpenStreetMap                             |
| Hosting      | Vercel                                              |

## 8. Data model
Public (readable by anyone, only approved listings):
- **listings**: id, host_id, title, description, type, price, deposit, bedrooms, bathrooms,
  city, state, region (set from the address), neighborhood (filled by admin lookup), approx_lat, approx_lng, available_from, amenities (checklist). The site says nothing about who pays utilities; only the lease fills it in (landlord for rooms and basements, tenant for houses and apartments). The old utilities columns are unused., show_exact_address, parking,
  pets_allowed, status (pending/active/rejected/rented), reviewed_at, created_at
- **listing_photos**: id, listing_id, path, order
- **profiles**: id, display_name (first name only), role (renter/host/admin), created_at

Private (owner and admin only):
- **private_profiles**: user_id, email, language, banned
- **listing_addresses**: listing_id, street_address, unit, zip, exact_lat, exact_lng
- **address_requests**: id, listing_id, renter_id, status (pending/approved/declined/revoked)
- **conversations**: id, listing_id, renter_id, host_id, created_at
- **messages**: id, conversation_id, sender_id, body, created_at, read_at
- **favorites**: user_id, listing_id
- **reports**: id, target_type (listing/conversation/user), target_id, reporter_id, reason, status

## 9. Build phases
| # | Phase | Status |
|---|---|---|
| 0 | Name, brand, Next.js project | Done |
| 1 | Home, Search, Listing detail pages (sample data) | Done |
| 2 | Supabase: tables, security rules, move sample data in | Done |
| 3 | Accounts: sign up, log in, profile | Done (Google sign-in optional, not set up yet) |
| 4 | Post a listing with photos + admin approval queue and notifications | Done |
| 5 | Real search + map with approximate locations | Done |
| 6 | In-app messaging + address requests | Done (email alerts for new messages: at launch) |
| 7 | Favorites | Done |
| 8 | Amharic | Next |
| 9 | Reports, bans, Safety page, Terms, Privacy Policy | |
| 10 | Security review, domain, launch on Vercel | Domain + Vercel done (testing); security review before public launch |
| 11 | Promote in community Facebook and Telegram groups, churches and restaurants | |

## 10. Before launch checklist
Things set up for development that must change before real users arrive:
- [x] Buy the domain: **kiraybet.org** (Cloudflare, Oct 12, 2026).
- [x] Point kiraybet.org at Vercel (live at https://kiraybet.org; www redirects; deploys on every push to GitHub main).
- [x] Resend: kiraybet.org verified; sign-in emails from hello@kiraybet.org (SMTP in
      supabase/config.toml), alerts from alerts@kiraybet.org.
- [x] Supabase Auth: site_url https://kiraybet.org, redirects for kiraybet.org, www and localhost.
- [x] Cloudflare Turnstile: real keys for kiraybet.org, www and localhost (site, Vercel, Supabase).
- [ ] Remove the sample listings and fake hosts from supabase/seed.sql data in the database.
- [ ] Remove the 112 test listings added Oct 15, 2026 (all 11 areas; 33 fake hosts named
      test-host-<area>-<n>@example.com, ids starting c1000000-, listings d1000000-):
      `delete from public.listings where host_id::text like 'c1000000-%';
      delete from auth.users where id::text like 'c1000000-%';` then delete the matching
      c1000000-… folders in the listing-photos storage bucket.
- [x] Set NEXT_PUBLIC_SITE_URL to the real domain in Vercel.
- [ ] Email alerts for new messages: needs the domain (Resend) and the Supabase secret key
      as a server-only env var to look up the recipient's email.
- [ ] Optional: Google sign-in (Google Cloud OAuth client, then NEXT_PUBLIC_GOOGLE_SIGN_IN=on).
- [ ] Allow search engines: set NEXT_PUBLIC_ALLOW_INDEXING=on in Vercel (off while testing).
- [ ] Lease agreements: Colorado attorney reviews all four (Admin → Leases), marks them reviewed.
- [ ] Lease agreements for the other states (DC, MD, VA, WA, TX, MN, OR, GA, CA). Until then the
      Lease button is hidden outside Colorado (leaseStates in src/lib/regions.ts).
- [ ] Security review, Terms of Service and Privacy Policy reviewed by a lawyer.

## 11. Legal notes
- **Fair Housing:** the Fair Housing Act and Colorado law forbid ads that state a preference
  based on national origin, race or religion. The site can be community-focused (Amharic,
  cultural branding, promotion in Habesha spaces), but listings must be open to everyone.
  Hosts may not write "Habesha only". Show a Fair Housing notice on the listing form and
  block prohibited phrases. Roommate listings have more flexibility.
- **Privacy:** Colorado has a consumer privacy law; the Privacy Policy must say what we
  collect, why, and how users can delete their account and data.
- Have a lawyer review the Terms of Service and Privacy Policy before launch.
