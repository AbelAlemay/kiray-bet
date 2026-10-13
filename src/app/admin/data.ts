import "server-only";
import type { createServerSupabase } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createServerSupabase>>;

// Signed links (1 hour) for photos in the private bucket, keyed by path.
export async function signPhotos(supabase: Supabase, paths: string[]) {
  const { data } = paths.length
    ? await supabase.storage.from("listing-photos").createSignedUrls(paths, 3600)
    : { data: [] };
  return new Map((data ?? []).map((s) => [s.path, s.signedUrl]));
}

export function sortedPhotos(photos: { path: string; order: number }[]) {
  return [...photos].sort((a, b) => a.order - b.order);
}

// ISO timestamp `days` ago, for "new this week" counts. Only call at request time.
export function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

// The admin search box, cleaned for use inside a database filter: characters that
// have meaning there (commas, parentheses, wildcards, quotes) are dropped.
export function searchTerm(raw: unknown) {
  return typeof raw === "string" ? raw.replace(/[,()*%\\'"]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60) : "";
}

// Ids of users whose first name or email contains `q`.
export async function matchingUserIds(supabase: Supabase, q: string) {
  const [byName, byEmail] = await Promise.all([
    supabase.from("profiles").select("id").ilike("display_name", `%${q}%`).limit(200),
    supabase.from("private_profiles").select("user_id").ilike("email", `%${q}%`).limit(200),
  ]);
  return [...new Set([...(byName.data ?? []).map((r) => r.id), ...(byEmail.data ?? []).map((r) => r.user_id)])];
}

// Filter for listings whose title, neighborhood or city matches, or whose host does.
export async function listingSearchFilter(supabase: Supabase, q: string) {
  const hostIds = await matchingUserIds(supabase, q);
  const clauses = [`title.ilike.%${q}%`, `neighborhood.ilike.%${q}%`, `city.ilike.%${q}%`];
  if (hostIds.length) clauses.push(`host_id.in.(${hostIds.join(",")})`);
  return clauses.join(",");
}
