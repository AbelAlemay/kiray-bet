import { createBrowserClient } from "@supabase/ssr";

// Browser client using the signed-in user's session cookie. Used only for uploading
// photos straight to storage; the database's rules decide what it may do.
export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
