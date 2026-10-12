# ኪራይ ቤት · KirayBet

Rental listings for the Habesha community in the Denver metro area. See [PLAN.md](PLAN.md)
for decisions, the security model and build phases.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Without Supabase keys the site shows the sample listings in `src/lib/sample-listings.ts`.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com) (region: US West or US East).
2. Link it and apply the schema, security rules and sample data:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push --include-seed
   ```
3. Copy `.env.example` to `.env.local` and fill in the project URL and publishable key
   (Project Settings → API Keys). Restart `npm run dev`.

## Database

- `supabase/migrations/` — tables, Row Level Security policies, triggers.
- `supabase/seed.sql` — six sample listings with fake hosts. Remove before launch.
- `npm run test:db` — checks the security rules (who can read and write what) against an
  in-memory Postgres. No Docker needed. Run it after every database change.
