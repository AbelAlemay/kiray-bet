import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser, safeNext } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

const errors: Record<string, string> = {
  link: "That sign-in link has expired or was already used. Please request a new code.",
  google: "Google sign-in didn't work. Please try again or use your email.",
};

async function Login({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getCurrentUser()) redirect(next);

  const error = typeof params.error === "string" ? errors[params.error] : undefined;

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-xl border border-danger/40 p-3 text-sm text-danger">
          {error}
        </p>
      )}
      <LoginForm next={next} googleEnabled={process.env.NEXT_PUBLIC_GOOGLE_SIGN_IN === "on"} />
    </>
  );
}

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold">Sign in · ይግቡ</h1>
        <p className="mb-6 mt-1 text-sm text-muted">
          To post a home, message a host, or save listings.
        </p>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-border/50" />}>
          <Login searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}
