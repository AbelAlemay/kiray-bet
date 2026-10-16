"use server";

import { cookies } from "next/headers";
import { getCurrentUser } from "./auth";
import { isLang, langCookie } from "./i18n";
import { createServerSupabase } from "./supabase/server";

// Remembers the visitor's language (and saves it to their profile when signed in).
export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(langCookie, lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
  const user = await getCurrentUser();
  if (user && user.language !== lang) {
    const supabase = await createServerSupabase();
    await supabase.from("private_profiles").update({ language: lang }).eq("user_id", user.id);
  }
}
