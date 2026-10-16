import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, safeNext } from "@/lib/auth";
import type { T } from "@/lib/i18n";
import { getT } from "@/lib/i18n-server";
import { LoginForm } from "./LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Sign in", "ይግቡ"), robots: { index: false } };
}

// Why the visitor is here, based on where they were going. Signing in and joining
// are the same step (the first code creates the account), so say so plainly.
function intro(next: string, t: T) {
  if (next.startsWith("/messages/new")) {
    return t(
      "To message the host, just confirm your email. We'll send you a 6-digit code. New here? That's all it takes, no password or sign-up form.",
      "ባለቤቱን መልዕክት ለመላክ ኢሜይልዎን ብቻ ያረጋግጡ። ባለ 6 አሃዝ ኮድ እንልክልዎታለን። አዲስ ነዎት? የሚያስፈልገው ይኸው ብቻ ነው፤ የይለፍ ቃል ወይም የምዝገባ ቅጽ የለም።",
    );
  }
  if (next.startsWith("/listings/new") || next.startsWith("/listings/mine")) {
    return t(
      "To post a home, confirm your email. We'll send you a 6-digit code. New here? That creates your free account, no password needed.",
      "ቤት ለማስተዋወቅ ኢሜይልዎን ያረጋግጡ። ባለ 6 አሃዝ ኮድ እንልክልዎታለን። አዲስ ነዎት? ይህ ነጻ መለያዎን ይፈጥራል፤ የይለፍ ቃል አያስፈልግም።",
    );
  }
  if (next.startsWith("/saved")) {
    return t(
      "To save homes, confirm your email. We'll send you a 6-digit code. New here? That creates your free account, no password needed.",
      "ቤቶችን ለማስቀመጥ ኢሜይልዎን ያረጋግጡ። ባለ 6 አሃዝ ኮድ እንልክልዎታለን። አዲስ ነዎት? ይህ ነጻ መለያዎን ይፈጥራል፤ የይለፍ ቃል አያስፈልግም።",
    );
  }
  return t(
    "New or returning, it's the same: enter your email and we'll send a 6-digit code. No password, no sign-up form.",
    "አዲስም ሆኑ ተመላሽ፣ ሂደቱ አንድ ነው፦ ኢሜይልዎን ያስገቡ፤ ባለ 6 አሃዝ ኮድ እንልክልዎታለን። የይለፍ ቃል የለም፣ የምዝገባ ቅጽ የለም።",
  );
}

const errors = (t: T): Record<string, string> => ({
  link: t(
    "That sign-in link didn't work. Links last 15 minutes and work once, and asking for a new code cancels older links. Enter your email below to get a fresh one.",
    "የመግቢያ ሊንኩ አልሠራም። ሊንኮች ለ15 ደቂቃ ያገለግላሉ፣ አንድ ጊዜ ብቻ ይሠራሉ፤ አዲስ ኮድ ሲጠይቁም የቆዩት ይሰረዛሉ። አዲስ ለማግኘት ኢሜይልዎን ከታች ያስገቡ።",
  ),
  google: t(
    "Google sign-in didn't finish. You may have closed the Google window. Please try again, or sign in with your email instead.",
    "በGoogle መግባት አልተጠናቀቀም። የGoogle መስኮቱን ዘግተውት ሊሆን ይችላል። እባክዎ እንደገና ይሞክሩ ወይም በኢሜይልዎ ይግቡ።",
  ),
});

async function Login({ searchParams }: { searchParams: PageProps<"/[lang]/login">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);
  const t = await getT();

  const error = typeof params.error === "string" ? errors(t)[params.error] : undefined;

  return (
    <>
      <p className="mb-6 mt-1 text-sm text-muted">{intro(next, t)}</p>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-danger/40 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <LoginForm next={next} googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "on"} />
    </>
  );
}

export default async function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">{t.both("Sign in or join", "ይግቡ ወይም ይመዝገቡ")}</h1>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-border/50" />}>
          <Login searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
