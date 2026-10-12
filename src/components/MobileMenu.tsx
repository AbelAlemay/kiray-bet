"use client";

import { useRef, type ReactNode } from "react";

// Collapsible menu for small screens. Closes when a link or button inside is used.
export function MobileMenu({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDetailsElement>(null);

  return (
    <details ref={menu} className="group lg:hidden">
      <summary className="cursor-pointer list-none rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-brand-soft [&::-webkit-details-marker]:hidden">
        <span className="group-open:hidden">☰ Menu</span>
        <span className="hidden group-open:inline">✕ Close</span>
      </summary>
      <nav
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a, button") && menu.current) menu.current.open = false;
        }}
        className="absolute inset-x-0 top-full flex flex-col gap-1 border-b border-border bg-surface p-3 text-sm shadow-lg"
      >
        {children}
      </nav>
    </details>
  );
}
