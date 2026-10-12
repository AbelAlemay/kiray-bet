import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { site } from "@/lib/site";

const navLinkClass = "rounded-lg px-3 py-2 hover:bg-brand-soft";

function SignInLink() {
  return (
    <Link href="/login" className={navLinkClass}>
      Log in
    </Link>
  );
}

// Reads the session, so it streams in behind a Suspense boundary.
async function AccountLink() {
  const user = await getCurrentUser();
  if (!user) return <SignInLink />;
  return (
    <Link href="/account" className={`${navLinkClass} font-semibold`}>
      {user.name ?? "Account"}
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand text-lg font-bold text-white">
            ቤ
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold">{site.name}</span>
            <span className="block text-xs text-muted">{site.nameLatin} · Denver</span>
          </span>
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <Link href="/search" className={`hidden sm:block ${navLinkClass}`}>
            Browse
          </Link>
          <Suspense fallback={<SignInLink />}>
            <AccountLink />
          </Suspense>
          <Link
            href="/listings/new"
            className="rounded-lg bg-brand px-3 py-2 font-semibold text-white hover:bg-brand-strong"
          >
            Post a home
          </Link>
        </nav>
      </div>
    </header>
  );
}
