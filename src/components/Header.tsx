import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/conversations";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

const linkClass = "whitespace-nowrap rounded-lg px-3 py-2 hover:bg-brand-soft lg:px-2 xl:px-3";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Browse" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function MainLinks() {
  return mainLinks.map((l) => (
    <Link key={l.href} href={l.href} className={linkClass}>
      {l.label}
    </Link>
  ));
}

function SignInLink() {
  return (
    <Link href="/login" className={linkClass}>
      Log in
    </Link>
  );
}

// Reads the session, so it streams in behind a Suspense boundary.
async function AccountLinks() {
  const user = await getCurrentUser();
  if (!user) return <SignInLink />;
  const unread = await getUnreadCount(user.id);
  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className={linkClass}>
          Admin
        </Link>
      )}
      <Link href="/listings/mine" className={linkClass}>
        My listings
      </Link>
      <Link href="/messages" className={linkClass} aria-label={unread ? `Messages, ${unread} unread` : undefined}>
        Messages
        {unread > 0 && (
          <span className="ml-1.5 rounded-full bg-door px-1.5 py-0.5 text-xs font-bold text-[#1c1a17]">{unread}</span>
        )}
      </Link>
      <Link href="/account" className={`${linkClass} font-semibold`}>
        {user.name ?? "Account"}
      </Link>
      <form action={signOut} className="contents">
        <button className={`${linkClass} text-left text-muted`}>Sign out</button>
      </form>
    </>
  );
}

function PostLink() {
  return (
    <Link
      href="/listings/new"
      className="block whitespace-nowrap rounded-lg bg-brand px-3 py-2.5 font-semibold text-white hover:bg-brand-strong"
    >
      Post a home
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Logo />
          <span className="leading-tight">
            <span className="block text-lg font-bold">{site.name}</span>
            <span className="block text-xs text-muted">{site.nameLatin} · Denver</span>
          </span>
        </Link>

        {/* Wide screens: everything in one row */}
        <nav className="hidden items-center gap-0.5 text-sm lg:flex xl:gap-1">
          <MainLinks />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Suspense fallback={<SignInLink />}>
            <AccountLinks />
          </Suspense>
          <span className="ml-1">
            <PostLink />
          </span>
        </nav>

        {/* Small screens: Post button plus a menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-sm">
            <PostLink />
          </span>
          <MobileMenu>
            <MainLinks />
            <hr className="my-1 border-border" />
            <Suspense fallback={<SignInLink />}>
              <AccountLinks />
            </Suspense>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
