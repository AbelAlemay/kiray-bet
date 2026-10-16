"use client";

import Link from "next/link";
import { WithCount } from "./CountBadge";
import { LinkPending } from "./Pending";
import { useSaved } from "./SavedProvider";

// Header link to saved homes, with the live count of saved homes.
export function SavedLink({ className }: { className: string }) {
  const { count } = useSaved();
  return (
    <Link href="/saved" className={className} aria-label={count ? `Saved homes, ${count}` : "Saved homes"}>
      <LinkPending />
      <WithCount count={count}>♡ Saved</WithCount>
    </Link>
  );
}
