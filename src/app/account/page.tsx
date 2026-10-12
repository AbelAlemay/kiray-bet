import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser, safeNext } from "@/lib/auth";
import { signOut } from "../login/actions";
import { AccountForm } from "./AccountForm";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

type Props = PageProps<"/account">;

async function Account({ searchParams }: { searchParams: Props["searchParams"] }) {
  const user = await requireUser("/account");
  const params = await searchParams;
  const next = params.welcome ? safeNext(params.next) : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {next && (
          <div className="mb-6">
            <h2 className="text-xl font-bold">Welcome to KirayBet! · እንኳን ደህና መጡ!</h2>
            <p className="mt-1 text-sm text-muted">What should we call you? Then we&apos;ll take you on.</p>
          </div>
        )}
        <AccountForm user={user} next={next} />
      </div>
      <Link
        href="/listings/mine"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 font-semibold hover:bg-brand-soft"
      >
        My listings · የእኔ ቤቶች <span aria-hidden>→</span>
      </Link>
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm sm:p-8">
        <p className="text-muted">Signed in as</p>
        <p className="font-semibold">{user.email}</p>
        <p className="mt-1 text-xs text-muted">
          🔒 Only you can see your email. Hosts and renters never see it.
        </p>
        <form action={signOut} className="mt-4">
          <button className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-brand-soft">
            Sign out · ይውጡ
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AccountPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <h1 className="mb-6 text-2xl font-bold">Your account · መለያዎ</h1>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-border/50" />}>
        <Account searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
