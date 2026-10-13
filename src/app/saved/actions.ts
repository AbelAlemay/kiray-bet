"use server";

import { getCurrentUser } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

// Saved homes ("favorites"). The database only lets users see and change their own.

// Ids of the signed-in user's saved homes, or null when signed out.
export async function getSavedIds(): Promise<string[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("favorites").select("listing_id").eq("user_id", user.id).limit(1000);
  return (data ?? []).map((f) => f.listing_id);
}

export async function setSaved(listingId: string, saved: boolean): Promise<{ ok: boolean; signedOut?: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, signedOut: true };
  const supabase = await createServerSupabase();
  const { error } = saved
    ? await supabase.from("favorites").upsert({ user_id: user.id, listing_id: listingId }, { ignoreDuplicates: true })
    : await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
  return { ok: !error };
}
