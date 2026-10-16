"use client";

import Link from "next/link";
import { WithCount } from "./CountBadge";
import { LinkPending } from "./Pending";
import { useT } from "./LangProvider";
import { useSaved } from "./SavedProvider";

// Header link to saved homes, with the live count of saved homes.
export function SavedLink({ className }: { className: string }) {
  const { count } = useSaved();
  const t = useT();
  const name = t("Saved homes", "የተቀመጡ ቤቶች");
  return (
    <Link href="/saved" className={className} aria-label={count ? `${name}, ${count}` : name}>
      <LinkPending />
      <WithCount count={count}>♡ {t("Saved", "የተቀመጡ")}</WithCount>
    </Link>
  );
}
