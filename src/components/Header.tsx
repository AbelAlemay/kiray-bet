import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/[lang]/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/conversations";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { WithCount } from "./CountBadge";
import { MobileMenu } from "./MobileMenu";
import { FormPending, LinkPending } from "./Pending";
import { SavedLink } from "./SavedLink";

const linkClass =
  "relative whitespace-nowrap rounded-lg px-3 py-2 hover:bg-brand-soft lg:px-2 xl:px-3";

const mainLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Browse" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function MainLinks() {
  return mainLinks.map((l) => (
    <Link key={l.href} href={l.href} className={linkClass}>
      <LinkPending />
      {l.label}
    </Link>
  ));
}

function SignInLink() {
  return (
    <Link href="/login" className={linkClass}>
      <LinkPending />
      Sign in / Join
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
          <LinkPending />
          Admin
        </Link>
      )}
      <SavedLink className={linkClass} />
      <Link href="/listings/mine" className={linkClass}>
        <LinkPending />
        My listings
      </Link>
      <Link
        href="/messages"
        className={linkClass}
        aria-label={unread ? `Messages, ${unread} unread` : undefined}
      >
        <LinkPending />
        <WithCount count={unread}>Messages</WithCount>
      </Link>
      <Link href="/account" className={`${linkClass} font-semibold`}>
        <LinkPending />
        {user.name ?? "Account"}
      </Link>
      <form action={signOut} className="contents">
        <button className={`${linkClass} text-left text-muted`}>
          <FormPending />
          Sign out
        </button>
      </form>
    </>
  );
}

// Unread count on the closed phone menu button, so new messages aren't hidden.
async function MenuBadge() {
  const user = await getCurrentUser();
  if (!user) return null;
  const unread = await getUnreadCount(user.id);
  return unread > 0 ? (
    <span className="ml-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-600 px-1 align-[2px] text-[11px] font-bold leading-none text-white">
      <span className="sr-only">, </span>
      {unread > 99 ? "99+" : unread}
      <span className="sr-only"> unread messages</span>
    </span>
  ) : null;
}

function PostLink() {
  return (
    <Link
      href="/listings/new"
      className="relative block whitespace-nowrap rounded-lg bg-brand px-3 py-2.5 font-semibold text-white hover:bg-brand-strong"
    >
      <LinkPending />
      Post a home
    </Link>
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-20 print:hidden border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" aria-label={`${site.name} ${site.nameLatin}, home`} className="relative">
            <LinkPending />
            <Logo />
          </Link>
          {/* Gold like the logo's door, with a soft shadow and glow so it stands off the bar. */}
          <Link href="/" className="leading-none">
            <span className="block text-xl font-bold text-door [text-shadow:0_2px_0_rgb(0_0_0/0.55),0_0_14px_rgb(245_199_90/0.3)]">
              {site.name}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
              {site.nameLatin}
            </span>
          </Link>
        </div>

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
          <MobileMenu
            badge={
              <Suspense>
                <MenuBadge />
              </Suspense>
            }
          >
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
