# Habesha Homes Denver — Project Plan

A rental marketplace for the Habesha (Ethiopian & Eritrean) community in the Denver metro
area. Landlords can list houses, apartments, basements and rooms. Renters can search and
contact them, in English or Amharic.

## 1. Who uses it
- **Landlords / hosts** list a whole house, an apartment, a basement unit or a single room.
- **Renters** search, save favorites and message hosts.
- **Admin (you)** approves or removes listings, handles reports and bans scammers.

## 2. MVP features (version 1)
1. Sign up / log in (email or Google, plus phone number)
2. Create, edit and delete a listing: title, type, price, deposit, bedrooms and baths,
   address and area, available date, utilities included, parking, photos, description
3. Browse and search: filter by city (Aurora, Denver, Lakewood, Englewood, Centennial...),
   price, bedrooms, type and move-in date
4. Map view of listings
5. Listing detail page with a photo gallery and a "Contact host" button
6. In-app messaging between renter and host
7. Saved / favorite listings
8. English ⇄ Amharic language toggle (Tigrinya later)
9. Report a listing, plus an admin page to moderate
10. Mobile-first design, since most users will be on their phones

## 3. Later (version 2+)
- Verified host badge (ID or phone check)
- Roommate-finder posts ("looking for a room")
- Paid "featured" listings (Stripe) as the revenue model
- Email and SMS alerts for new matching listings
- Reviews and ratings
- Mobile app (React Native or a PWA)

## 4. Recommended tech stack
| Layer        | Choice                                          | Why                                       |
|--------------|-------------------------------------------------|-------------------------------------------|
| Frontend     | **Next.js (React) + TypeScript + Tailwind CSS** | Fast, SEO-friendly, easy to deploy        |
| Backend / DB | **Supabase** (Postgres, Auth, Storage)          | Login, database and photo storage in one; free tier |
| Maps         | Mapbox or Leaflet + OpenStreetMap               | Leaflet is free                           |
| i18n         | next-intl                                       | English and Amharic translations          |
| Hosting      | Vercel                                          | Free tier, one-click deploys              |
| Payments     | Stripe (phase 2)                                | Featured listings                         |

## 5. Data model (first draft)
- **users**: id, name, email, phone, language, role (renter/host/admin), verified, created_at
- **listings**: id, host_id, title, description, type (house/apartment/basement/room),
  price, deposit, bedrooms, bathrooms, city, neighborhood, address, lat, lng,
  available_from, utilities_included, parking, pets_allowed, status (pending/active/rented), created_at
- **listing_photos**: id, listing_id, url, order
- **favorites**: user_id, listing_id
- **conversations / messages**: id, listing_id, sender_id, receiver_id, body, created_at, read
- **reports**: id, listing_id, reporter_id, reason, status

## 6. Build steps
| Step | What                                                                 |
|------|----------------------------------------------------------------------|
| 0    | Choose the name and brand colors, then set up the Next.js project, Supabase and Git |
| 1    | Design the pages: Home, Search, Listing, Post a listing, Messages, Profile, Admin |
| 2    | Authentication (sign up, log in, profile)                            |
| 3    | Database tables and security rules in Supabase                       |
| 4    | Post a listing, with photo upload                                    |
| 5    | Browse, search, filters and map                                      |
| 6    | Listing detail page and favorites                                    |
| 7    | Messaging                                                            |
| 8    | Amharic translation                                                  |
| 9    | Admin moderation and reporting                                       |
| 10   | Testing, domain name and launch on Vercel                            |
| 11   | Promote it in community Facebook and Telegram groups and at churches and restaurants |

## 7. Legal note: Fair Housing
The **Fair Housing Act** and **Colorado law** forbid housing ads that state a preference
based on national origin, race or religion. The site can be *community-focused*: Amharic
language, cultural branding and promotion in Habesha spaces. However:
- Listings must be open to everyone, and hosts may not write "Habesha only" or "Ethiopians only".
- Add a Fair Housing notice to the listing form and filter for prohibited phrases.
- Roommate and shared-room listings have more flexibility under the law.
- Have a lawyer review the Terms of Service before launch.
