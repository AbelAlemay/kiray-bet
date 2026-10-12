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
