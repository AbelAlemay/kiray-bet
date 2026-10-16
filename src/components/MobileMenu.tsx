"use client";

import { useRef, type ReactNode } from "react";
import { useT } from "./LangProvider";

// Collapsible menu for small screens. Closes when a link or button inside is used.
// `badge` (e.g. the unread message count) shows on the closed Menu button.
export function MobileMenu({ children, badge }: { children: ReactNode; badge?: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);
  const t = useT();

  return (
    <details ref={menu} className="group xl:hidden">
      <summary className="cursor-pointer list-none whitespace-nowrap rounded-lg border border-border px-3 py-2.5 text-sm font-semibold hover:bg-brand-soft [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">☰ {t("Menu", "ማውጫ")}{badge}</span>
        <span className="hidden group-open:inline">✕ {t("Close", "ዝጋ")}</span>
      </summary>
      <nav
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, form button") && menu.current) menu.current.open = false;
        }}
        className="absolute inset-x-0 top-full flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-b border-border bg-surface p-3 text-base shadow-lg [&_a]:py-3 [&_button]:py-3"
      >
        {children}
      </nav>
    </details>
  );
}
