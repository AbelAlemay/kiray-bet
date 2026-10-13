import type { ReactNode } from "react";

// A label with a small red count in its top-right corner (hidden at zero).
export function WithCount({ count, children }: { count: number; children: ReactNode }) {
  return (
    <span className="relative inline-block">
      {children}
      {count > 0 && (
        <span
          aria-hidden
          className="absolute -right-3.5 -top-2.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-surface"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
}
