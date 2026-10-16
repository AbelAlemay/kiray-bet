import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser, safeNext } from "@/lib/auth";
import { signOut } from "../login/actions";
import { AccountForm } from "./AccountForm";
import { FormPending } from "@/components/Pending";
import { getT } from "@/lib/i18n-server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t("Your account", "መለያዎ"), robots: { index: false } };
}

type Props = PageProps<"/[lang]/account">;

async function Account({ searchParams }: { searchParams: Props["searchParams"] }) {
  const user = await requireUser("/account");
  const params = await searchParams;
  const next = params.welcome ? safeNext(params.next) : undefined;
  const t = await getT();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        {next && (
          <div className="mb-6">
            <h2 className="text-xl font-bold">{t.both("Welcome to KirayBet!", "እንኳን ደህና መጡ!")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t("What should we call you? Then we'll take you on.", "በምን ስም እንጥራዎት? ከዚያም እንቀጥላለን።")}
            </p>
          </div>
        )}
        <AccountForm user={user} next={next} />
      </div>
      <Link
        href="/listings/mine"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 font-semibold hover:bg-brand-soft"
      >
        {t.both("My listings", "የእኔ ቤቶች")} <span aria-hidden>→</span>
      </Link>
      <div className="rounded-2xl border border-border bg-surface p-6 text-sm sm:p-8">
        <p className="text-muted">{t("Signed in as", "የገቡበት ኢሜይል")}</p>
        <p className="font-semibold">{user.email}</p>
        <p className="mt-1 text-xs text-muted">
          🔒 {t("Only you can see your email. Hosts and renters never see it.", "ኢሜይልዎን ማየት የሚችሉት እርስዎ ብቻ ነዎት። ባለቤቶችና ተከራዮች በፍጹም አያዩትም።")}
        </p>
        <form action={signOut} className="mt-4">
          <button className="relative rounded-xl border border-border px-4 py-2 font-semibold hover:bg-brand-soft">
            <FormPending />
            {t.both("Sign out", "ይውጡ")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default async function AccountPage({ searchParams }: Props) {
  const t = await getT();
  return (
    <div className="mx-auto max-w-md px-4 pt-10">
      <h1 className="mb-6 text-2xl font-bold">{t.both("Your account", "መለያዎ")}</h1>
      <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-border/50" />}>
        <Account searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
