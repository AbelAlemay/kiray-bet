"use server";

import { redirect } from "next/navigation";
import { pathAfterSignIn, safeNext, siteUrl } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import type { AuthError } from "@supabase/supabase-js";
import type { T } from "@/lib/i18n";
import { getActionT } from "@/lib/i18n-server";

// `retryAfter`: seconds until another code may be sent (the page counts it down).
export type LoginState =
  // `email` keeps what was typed, so an error doesn't clear the box.
  // `perMinute`: the error is the one-code-a-minute limit (the page shows a countdown).
  | { step: "email"; error?: string; email?: string; retryAfter?: number; perMinute?: boolean }
  | { step: "code"; email: string; error?: string; retryAfter?: number; perMinute?: boolean };

// Supabase allows one code per address per minute.
const resendSeconds = 60;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Plain-language reasons for sign-in problems, so people know what to do next.
// Based on Supabase's error codes; anything unknown gets a gentle general message.
function sendCodeError(error: AuthError, email: string, t: T) {
  const couldNotSend = t(
    `We couldn't send an email to ${email}. Please check the address is spelled right. If it is, try again in a few minutes. If it keeps happening, contact us.`,
    `ወደ ${email} ኢሜይል መላክ አልቻልንም። አድራሻው በትክክል መጻፉን ያረጋግጡ። ትክክል ከሆነ ከጥቂት ደቂቃዎች በኋላ እንደገና ይሞክሩ። ችግሩ ከቀጠለ ያግኙን።`,
  );
  switch (error.code) {
    case "over_email_send_rate_limit":
      return waitSeconds(error)
        ? t("For your security, a new code can be sent once a minute.", "ለደህንነትዎ ሲባል አዲስ ኮድ የሚላከው በደቂቃ አንድ ጊዜ ብቻ ነው።")
        : t(
            "We've sent several codes to this address recently. Please wait a few minutes, then try again.",
            "በቅርቡ ወደዚህ አድራሻ ብዙ ኮዶች ልከናል። እባክዎ ጥቂት ደቂቃዎች ጠብቀው እንደገና ይሞክሩ።",
          );
    case "over_request_rate_limit":
      return t(
        "Too many attempts from this device. Please wait a few minutes, then try again.",
        "ከዚህ መሣሪያ ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ደቂቃዎች ጠብቀው እንደገና ይሞክሩ።",
      );
    case "captcha_failed":
      return t(
        "Your browser didn't pass our quick safety check. Please refresh the page and try again.",
        "አሳሽዎ አጭሩን የደህንነት ፍተሻ አላለፈም። እባክዎ ገጹን አድሰው እንደገና ይሞክሩ።",
      );
    case "email_address_invalid":
    case "validation_failed":
      return t(
        "That doesn't look like a complete email address. It should look like name@gmail.com.",
        "ይህ የተሟላ የኢሜይል አድራሻ አይመስልም። እንደ name@gmail.com መምሰል አለበት።",
      );
    case "user_banned":
      return t(
        "This account has been suspended. If you think this is a mistake, please contact us.",
        "ይህ መለያ ታግዷል። ስህተት ነው ብለው ካሰቡ እባክዎ ያግኙን።",
      );
    case "email_address_not_authorized":
    case "unexpected_failure":
      return couldNotSend;
  }
  if (error.status === 429) {
    return t(
      "We've sent several codes recently. Please wait a few minutes, then try again.",
      "በቅርቡ ብዙ ኮዶች ልከናል። እባክዎ ጥቂት ደቂቃዎች ጠብቀው እንደገና ይሞክሩ።",
    );
  }
  // The email service refused or failed (reported without a code, e.g. "Error sending
  // magic link email").
  if (/sending .*email/i.test(error.message)) return couldNotSend;
  if (!error.status) {
    return t(
      "We couldn't reach the sign-in service. Please check your internet connection and try again.",
      "የመግቢያ አገልግሎቱን ማግኘት አልቻልንም። እባክዎ የኢንተርኔት ግንኙነትዎን አረጋግጠው እንደገና ይሞክሩ።",
    );
  }
  return t(
    "Something went wrong on our side while sending your code. Please try again in a moment.",
    "ኮድዎን ስንልክ በእኛ በኩል ችግር ተፈጥሯል። እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።",
  );
}

// "...you can only request this after 52 seconds" -> 52
function waitSeconds(error: AuthError) {
  const seconds = Number(error.message.match(/after (\d+) seconds?/)?.[1]);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function verifyCodeError(error: AuthError | null, t: T) {
  if (error?.status === 429 || error?.code === "over_request_rate_limit") {
    return t(
      "Too many tries. Please wait a few minutes, then send yourself a new code.",
      "ብዙ ሙከራዎች ተደርገዋል። እባክዎ ጥቂት ደቂቃዎች ጠብቀው አዲስ ኮድ ያስልኩ።",
    );
  }
  if (error?.code === "user_banned") {
    return t(
      "This account has been suspended. If you think this is a mistake, please contact us.",
      "ይህ መለያ ታግዷል። ስህተት ነው ብለው ካሰቡ እባክዎ ያግኙን።",
    );
  }
  return t(
    "That code didn't work. Codes last 15 minutes, and asking for a new code cancels the old one, so use the code from the newest email.",
    "ኮዱ አልሠራም። ኮዶች የሚያገለግሉት ለ15 ደቂቃ ነው፤ አዲስ ኮድ ሲጠይቁ የቀድሞው ይሰረዛል። ስለዚህ በአዲሱ ኢሜይል ያለውን ኮድ ይጠቀሙ።",
  );
}

function callbackUrl(next: string) {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

// Email sign-in in two steps: "send" emails a link and a 6-digit code, "verify" checks
// the code. Sending also creates the account the first time, so signing up and
// signing in are the same thing.
export async function emailSignIn(prev: LoginState, formData: FormData): Promise<LoginState> {
  const next = safeNext(formData.get("next"));
  const t = await getActionT();
  if (formData.get("intent") === "restart") return { step: "email" };
  if (formData.get("intent") === "verify" && prev.step === "code") {
    return verifyCode(prev, formData, next, t);
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (formData.get("agree") !== "on") {
    return {
      step: "email",
      email,
      error: t(
        "Please tick the box to agree to the Terms of Service and Privacy Policy.",
        "እባክዎ በአገልግሎት ውሉና በግላዊነት ፖሊሲው መስማማትዎን ለማሳየት ሳጥኑን ምልክት ያድርጉ።",
      ),
    };
  }
  if (!emailPattern.test(email) || email.length > 254) {
    return {
      step: "email",
      email,
      error: t(
        "That doesn't look like a complete email address. It should look like name@gmail.com.",
        "ይህ የተሟላ የኢሜይል አድራሻ አይመስልም። እንደ name@gmail.com መምሰል አለበት።",
      ),
    };
  }

  // Supabase checks the Turnstile token before sending any email.
  const captchaToken = String(formData.get("turnstileToken") ?? "") || undefined;
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: true, captchaToken },
  });
  if (error) {
    const back = prev.step === "code" ? prev : { step: "email" as const, email };
    const retryAfter = waitSeconds(error);
    const perMinute = error.code === "over_email_send_rate_limit" && !!retryAfter;
    return { ...back, error: sendCodeError(error, email, t), retryAfter, perMinute };
  }
  return { step: "code", email, retryAfter: resendSeconds };
}

async function verifyCode(
  prev: Extract<LoginState, { step: "code" }>,
  formData: FormData,
  next: string,
  t: T,
): Promise<LoginState> {
  const token = String(formData.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(token)) {
    return {
      ...prev,
      retryAfter: undefined,
      perMinute: false,
      error: t("The code is the 6 numbers in the email, for example 123456.", "ኮዱ በኢሜይሉ ውስጥ ያሉት 6 ቁጥሮች ናቸው፤ ለምሳሌ 123456።"),
    };
  }

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.verifyOtp({ email: prev.email, token, type: "email" });
  if (error || !data.user) {
    return { ...prev, retryAfter: undefined, perMinute: false, error: verifyCodeError(error, t) };
  }
  redirect(await pathAfterSignIn(supabase, data.user.id, next));
}

export async function signInWithGoogle(formData: FormData) {
  const next = safeNext(formData.get("next"));
  if (formData.get("agree") !== "on") redirect(`/login?next=${encodeURIComponent(next)}`);
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
