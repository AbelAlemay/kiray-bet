"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The signed-in person's name in the wide header, opening a menu of their pages
// (saved homes, messages, listings, account, sign out). Closes on a click outside,
// Escape, or choosing an item. `badge` (unread messages) shows on the closed button.
export function AccountMenu({ name, badge, children }: { name: string; badge?: ReactNode; children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent | KeyboardEvent) => {
      const d = menu.current;
      if (!d?.open) return;
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !d.contains(e.target as Node)) d.open = false;
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, []);

  return (
    <details ref={menu} className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 font-semibold hover:bg-brand-soft [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="grid h-6 w-6 place-items-center rounded-full bg-brand-soft text-xs text-brand">
          {name.slice(0, 1).toUpperCase()}
        </span>
        {name}
        {badge}
        <span aria-hidden className="text-xs text-muted transition group-open:rotate-180">
          ▾
        </span>
      </summary>
      <nav
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button") && menu.current) menu.current.open = false;
        }}
        className="absolute right-0 top-full z-40 mt-2 flex w-56 flex-col rounded-2xl border border-border bg-surface p-1.5 shadow-2xl [&>*]:w-full [&_a]:block [&_button]:w-full [&_button]:text-left"
      >
        {children}
      </nav>
    </details>
  );
}
