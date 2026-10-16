"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { regionCookie, regions, type RegionId } from "@/lib/regions";
import { Spinner } from "./Pending";

function rememberRegion(id: RegionId) {
  document.cookie = `${regionCookie}=${id}; path=/; max-age=31536000; SameSite=Lax`;
}

// The area picker under the logo: "📍 Denver ▾". The choice is remembered for a year
// and the page reloads for the new area (search keeps you on search).
export function RegionSwitcher({ current }: { current: RegionId }) {
  const [open, setOpen] = useState(false);
  const [switching, startSwitching] = useTransition();
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const name = regions.find((r) => r.id === current)?.name ?? "Denver";

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  function choose(id: RegionId) {
    setOpen(false);
    rememberRegion(id);
    startSwitching(() => {
      if (pathname.startsWith("/search")) router.push(`/search?region=${id}`);
      else router.refresh();
    });
  }

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Area: ${name}. Change area`}
        className="flex max-w-[11rem] items-center gap-1 rounded-md py-0.5 text-xs text-muted hover:text-foreground sm:max-w-none"
      >
        <span aria-hidden>📍</span>
        <span className="truncate font-semibold">{name}</span>
        {switching ? <Spinner className="h-2.5 w-2.5" /> : <span aria-hidden>▾</span>}
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Choose your area"
          className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl"
        >
          <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Choose your area · አካባቢ</li>
          {regions.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={r.id === current}
                onClick={() => choose(r.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-brand-soft ${
                  r.id === current ? "font-semibold text-brand" : ""
                }`}
              >
                <span>
                  {r.name}
                  <span className="block text-xs font-normal text-muted">{r.states.join(" · ")}</span>
                </span>
                {r.id === current && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
