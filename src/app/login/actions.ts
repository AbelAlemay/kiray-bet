"use server";

import { redirect } from "next/navigation";
import { pathAfterSignIn, safeNext, siteUrl } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function callbackUrl(next: string) {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

// Email sign-in in two steps: "send" emails a link and a 6-digit code, "verify" checks
// the code. Sending also creates the account the first time, so signing up and
// signing in are the same thing.
export async function emailSignIn(prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = safeNext(formData.get("next"));
  if (formData.get("intent") === "restart") return { step: "email" };
  if (formData.get("intent") === "verify" && prev.step === "code") {
    return verifyCode(prev, formData, next);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!emailPattern.test(email) || email.length > 254) {
    return { step: "email", error: "Please enter a valid email address." };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true },
  });
  if (error) {
    return {
      step: "email",
      error:
        error.status === 429
          ? "Too many emails sent. Please wait a few minutes and try again."
          : "We couldn't send the email. Please try again.",
    };
  }
  return { step: "code", email };
}

async function verifyCode(
  prev: Extract<LoginState, { step: "code" }>,
  formData: FormData,
  next: string,
): Promise<LoginState> {
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) {
    return { ...prev, error: "The code is 6 digits." };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.verifyOtp({ email: prev.email, token, type: "email" });
  if (error || !data.user) {
    return { ...prev, error: "That code is wrong or has expired. Check the email or send a new one." };
  }
  redirect(await pathAfterSignIn(supabase, data.user.id, next));
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next"));
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });
  if (error || !data.url) redirect(`/login?error=google&next=${encodeURIComponent(next)}`);
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/");
}
