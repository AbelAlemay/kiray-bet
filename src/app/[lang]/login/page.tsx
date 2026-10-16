import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

// Why the visitor is here, based on where they were going. Signing in and joining
// are the same step (the first code creates the account), so say so plainly.
function intro(next: string) {
  if (next.startsWith("/messages/new")) {
    return "To message the host, just confirm your email. We'll send you a 6-digit code. New here? That's all it takes, no password or sign-up form.";
  }
  if (next.startsWith("/listings/new") || next.startsWith("/listings/mine")) {
    return "To post a home, confirm your email. We'll send you a 6-digit code. New here? That creates your free account, no password needed.";
  }
  if (next.startsWith("/saved")) {
    return "To save homes, confirm your email. We'll send you a 6-digit code. New here? That creates your free account, no password needed.";
  }
  return "New or returning, it's the same: enter your email and we'll send a 6-digit code. No password, no sign-up form.";
}

const errors: Record<string, string> = {
  link: "That sign-in link didn't work. Links last 15 minutes and work once, and asking for a new code cancels older links. Enter your email below to get a fresh one.",
  google: "Google sign-in didn't finish. You may have closed the Google window. Please try again, or sign in with your email instead.",
};

async function Login({ searchParams }: { searchParams: PageProps<"/[lang]/login">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);

  const error = typeof params.error === "string" ? errors[params.error] : undefined;

  return (
    <>
      <p className="mb-6 mt-1 text-sm text-muted">{intro(next)}</p>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-danger/40 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <LoginForm next={next} googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "on"} />
    </>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/[lang]/login">) {
  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">Sign in or join · ይግቡ ወይም ይመዝገቡ</h1>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-border/50" />}>
          <Login searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
