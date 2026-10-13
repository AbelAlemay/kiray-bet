"use server";

import { redirect } from "next/navigation";
import { pathAfterSignIn, safeNext, siteUrl } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AuthError } from "@supabase/supabase-js";

export type LoginState =
  | { step: "email"; error?: string }
  | { step: "code"; email: string; error?: string };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Plain-language reasons for sign-in problems, so people know what to do next.
// Based on Supabase's error codes; anything unknown gets a gentle general message.
function sendCodeError(error: AuthError, email: string) {
  const waitSeconds = error.message.match(/after (\d+) seconds?/)?.[1];
  switch (error.code) {
    case "over_email_send_rate_limit":
      return waitSeconds
        ? `For your security, a new code can be sent once a minute. Please try again in ${waitSeconds} seconds.`
        : "We've sent several codes to this address recently. Please wait a few minutes, then try again.";
    case "over_request_rate_limit":
      return "Too many attempts from this device. Please wait a few minutes, then try again.";
    case "captcha_failed":
      return "Your browser didn't pass our quick safety check. Please refresh the page and try again.";
    case "email_address_invalid":
    case "validation_failed":
      return "That doesn't look like a complete email address. It should look like name@gmail.com.";
    case "user_banned":
      return "This account has been suspended. If you think this is a mistake, please contact us.";
    case "email_address_not_authorized":
    case "unexpected_failure":
      return `We couldn't send an email to ${email}. Please check the address is spelled right. If it is, try again in a few minutes. If it keeps happening, contact us.`;
  }
  if (error.status === 429) {
    return "We've sent several codes recently. Please wait a few minutes, then try again.";
  }
  // The email service refused or failed (reported without a code, e.g. "Error sending
  // magic link email").
  if (/sending .*email/i.test(error.message)) {
    return `We couldn't send an email to ${email}. Please check the address is spelled right. If it is, try again in a few minutes. If it keeps happening, contact us.`;
  }
  if (!error.status) {
    return "We couldn't reach the sign-in service. Please check your internet connection and try again.";
  }
  return "Something went wrong on our side while sending your code. Please try again in a moment.";
}

function verifyCodeError(error: AuthError | null) {
  if (error?.status === 429 || error?.code === "over_request_rate_limit") {
    return "Too many tries. Please wait a few minutes, then send yourself a new code.";
  }
  if (error?.code === "user_banned") {
    return "This account has been suspended. If you think this is a mistake, please contact us.";
  }
  return "That code didn't work. Codes last 15 minutes, and asking for a new code cancels the old one, so use the code from the newest email.";
}

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
    return { step: "email", error: "That doesn't look like a complete email address. It should look like name@gmail.com." };
  }

  // Supabase checks the Turnstile token before sending any email.
  const captchaToken = String(formData.get("turnstileToken") ?? "") || undefined;
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true, captchaToken },
  });
  if (error) {
    const back = prev.step === "code" ? prev : { step: "email" as const };
    return { ...back, error: sendCodeError(error, email) };
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
    return { ...prev, error: "The code is the 6 numbers in the email, for example 123456." };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.verifyOtp({ email: prev.email, token, type: "email" });
  if (error || !data.user) {
    return { ...prev, error: verifyCodeError(error) };
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
