import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/[lang]/login/actions";
import { getCurrentUser } from "@/lib/auth";
import { getUnreadCount } from "@/lib/conversations";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { WithCount } from "./CountBadge";
import { getT } from "@/lib/i18n-server";
import type { T } from "@/lib/i18n";
import { LangSwitch } from "./LangSwitch";
import { MobileMenu } from "./MobileMenu";
import { FormPending, LinkPending } from "./Pending";
import { SavedLink } from "./SavedLink";

const linkClass =
  "relative whitespace-nowrap rounded-lg px-3 py-2 hover:bg-brand-soft lg:px-2 xl:px-3";

const mainLinks = (t: T) => [
  { href: "/", label: t("Home", "መነሻ") },
  { href: "/search", label: t("Browse", "ቤቶችን ይመልከቱ") },
  { href: "/about", label: t("About", "ስለ እኛ") },
  { href: "/contact", label: t("Contact", "ያግኙን") },
];

function MainLinks({ t }: { t: T }) {
  return mainLinks(t).map((l) => (
    <Link key={l.href} href={l.href} className={linkClass}>
      <LinkPending />
      {l.label}
    </Link>
  ));
}

function SignInLink({ t }: { t: T }) {
  return (
    <Link href="/login" className={linkClass}>
      <LinkPending />
      {t("Sign in / Join", "ይግቡ / ይመዝገቡ")}
    </Link>
  );
}

// Reads the session, so it streams in behind a Suspense boundary.
async function AccountLinks({ t }: { t: T }) {
  const user = await getCurrentUser();
  if (!user) return <SignInLink t={t} />;
  const unread = await getUnreadCount(user.id);
  return (
    <>
      {user.role === "admin" && (
        <Link href="/admin" className={linkClass} lang="en">
          <LinkPending />
          Admin
        </Link>
      )}
      <SavedLink className={linkClass} />
      <Link href="/listings/mine" className={linkClass}>
        <LinkPending />
        {t("My listings", "የእኔ ማስታወቂያዎች")}
      </Link>
      <Link
        href="/messages"
        className={linkClass}
        aria-label={unread ? t(`Messages, ${unread} unread`, `መልዕክቶች፣ ${unread} ያልተነበቡ`) : undefined}
      >
        <LinkPending />
        <WithCount count={unread}>{t("Messages", "መልዕክቶች")}</WithCount>
      </Link>
      <Link href="/account" className={`${linkClass} font-semibold`}>
        <LinkPending />
        {user.name ?? t("Account", "መለያ")}
      </Link>
      <form action={signOut} className="contents">
        <button className={`${linkClass} text-left text-muted`}>
          <FormPending />
          {t("Sign out", "ይውጡ")}
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

function PostLink({ t }: { t: T }) {
  return (
    <Link
      href="/listings/new"
      className="relative block whitespace-nowrap rounded-lg bg-brand px-3 py-2.5 font-semibold text-white hover:bg-brand-strong"
    >
      <LinkPending />
      {t("Post a home", "ቤት ያስተዋውቁ")}
    </Link>
  );
}

export async function Header() {
  const t = await getT();
  return (
    <header className="sticky top-0 z-20 print:hidden border-b border-border bg-surface/90 backdrop-blur">
      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/" aria-label={t(`${site.name} ${site.nameLatin}, home`, `${site.name}፣ መነሻ ገጽ`)} className="relative">
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
          <MainLinks t={t} />
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <Suspense fallback={<SignInLink t={t} />}>
            <AccountLinks t={t} />
          </Suspense>
          <LangSwitch className="ml-1" />
          <span className="ml-1">
            <PostLink t={t} />
          </span>
        </nav>

        {/* Small screens: Post button plus a menu */}
        <div className="flex items-center gap-2 lg:hidden">
          <span className="text-sm">
            <PostLink t={t} />
          </span>
          <MobileMenu
            badge={
              <Suspense>
                <MenuBadge />
              </Suspense>
            }
          >
            <LangSwitch className="mb-1 self-start [&_button]:!py-2" />
            <MainLinks t={t} />
            <hr className="my-1 border-border" />
            <Suspense fallback={<SignInLink t={t} />}>
              <AccountLinks t={t} />
            </Suspense>
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
