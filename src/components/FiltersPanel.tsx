"use client";

import { useState, type ReactNode } from "react";

// On phones the search filters fold behind a button so results come first;
// on wide screens they're always shown.
export function FiltersPanel({ activeCount, children }: { activeCount: number; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between rounded-xl border border-border bg-surface px-4 font-semibold lg:hidden"
      >
        <span>
          ⚙︎ Filters · <span className="text-muted">ማጣሪያ</span>
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-xs text-white">{activeCount}</span>
          )}
        </span>
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>
      <div className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>{children}</div>
    </div>
  );
}
