"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type AccountState = { saved?: boolean; error?: string; name?: string; language?: "en" | "am" };

export async function updateAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in again." };

  const name = String(formData.get("name") ?? "").trim().split(/\s+/)[0];
  const language = formData.get("language") === "am" ? "am" : "en";
  if (!name || name.length > 40) {
    return { error: "Please enter your first name (up to 40 letters).", name, language };
  }

  // The database only lets users change their own name and language.
  const supabase = await createServerSupabase();
  const [profile, privateProfile] = await Promise.all([
    supabase.from("profiles").update({ display_name: name }).eq("id", user.id),
    supabase.from("private_profiles").update({ language }).eq("user_id", user.id),
  ]);
  if (profile.error || privateProfile.error) {
    return { error: "We couldn't save your changes. Please try again.", name, language };
  }

  // First-time setup continues to where the user was going; later edits stay here.
  const next = formData.get("next");
  if (next) redirect(safeNext(next));
  refresh(); // updates the name in the header
  return { saved: true, name, language };
}
