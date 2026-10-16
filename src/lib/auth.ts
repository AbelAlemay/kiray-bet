import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { isLang, langCookie } from "./i18n";
import { createServerSupabase } from "./supabase/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
  role: "renter" | "host" | "admin";
  language: "en" | "am";
  messageEmails: boolean;
  // "aal2" once this session was confirmed with an authenticator app code.
  twoStepVerified: boolean;
};

// The signed-in user, or null. Verifies the session token (getClaims), then loads the
// profile through the user's own client, so the database's security rules apply.
// Reads cookies: call it only inside a <Suspense> boundary.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Checking the session reads the clock (token expiry), so it must run per request,
  // never while Next.js prerenders.
  await connection();
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;

  const supabase = await createServerSupabase();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (!userId) return null;
  const twoStepVerified = data.claims.aal === "aal2";

  const [{ data: profile }, { data: privateProfile }] = await Promise.all([
    supabase.from("profiles").select("display_name, role").eq("id", userId).single(),
    supabase.from("private_profiles").select("email, language, message_emails").eq("user_id", userId).single(),
  ]);
  if (!profile || !privateProfile) return null;

  return {
    id: userId,
    email: privateProfile.email,
    name: profile.display_name,
    role: profile.role,
    language: privateProfile.language,
    messageEmails: privateProfile.message_emails ?? true,
    twoStepVerified,
  };
});

// For pages that need an account: sends visitors to sign in, then back here.
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

// Only allow returning to a page on this site, never to another website
// (e.g. "//evil.com" or "https://evil.com"). Accepts a path or a full URL on our site.
export function safeNext(value: unknown, fallback = "/"): string {
  if (typeof value !== "string" || !value) return fallback;
  try {
    const site = new URL(siteUrl());
    const target = new URL(value, site);
    if (target.origin !== site.origin) return fallback;
    // Email links carry next=<site>/auth/callback?next=/page; unwrap to the page.
    if (target.pathname === "/auth/callback") return safeNext(target.searchParams.get("next"), fallback);
    if (target.pathname.startsWith("/auth/") || target.pathname === "/login") return fallback;
    return target.pathname + target.search;
  } catch {
    return fallback;
  }
}

// Where to go right after signing in: new users without a name first set one on the
// account page, then continue to `next`.
export async function pathAfterSignIn(supabase: SupabaseClient, userId: string, next: string) {
  await syncLanguage(supabase, userId);
  const { data } = await supabase.from("profiles").select("display_name").eq("id", userId).single();
  return data?.display_name ? next : `/account?welcome=1&next=${encodeURIComponent(next)}`;
}

// On sign-in: a language chosen on this device is saved to the profile; otherwise the
// profile's language becomes this device's.
async function syncLanguage(supabase: SupabaseClient, userId: string) {
  const jar = await cookies();
  const chosen = jar.get(langCookie)?.value;
  if (isLang(chosen)) {
    await supabase.from("private_profiles").update({ language: chosen }).eq("user_id", userId);
    return;
  }
  const { data } = await supabase.from("private_profiles").select("language").eq("user_id", userId).single();
  if (isLang(data?.language)) jar.set(langCookie, data.language, { path: "/", maxAge: 31536000, sameSite: "lax" });
}

export function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
