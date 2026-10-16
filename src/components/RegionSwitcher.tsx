"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { regionCookie, regions, type RegionId } from "@/lib/regions";
import { Spinner } from "./Pending";

function rememberRegion(id: RegionId) {
  document.cookie = `${regionCookie}=${id}; path=/; max-age=31536000; SameSite=Lax`;
}

// The area picker: "📍 Denver area · Change ▾" on the home page banner and above search
// results. The choice is remembered for a year
// and the page reloads for the new area (search keeps you on search).
export function RegionSwitcher({ current, variant = "bar" }: { current: RegionId; variant?: "hero" | "bar" }) {
  const [open, setOpen] = useState(false);
  const [switching, startSwitching] = useTransition();
  const box = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const name = regions.find((r) => r.id === current)?.name ?? "Denver area";

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

  const button =
    variant === "hero" ? (
      // On the home page banner: a bright pill so nobody misses that the area can change.
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Area: ${name}. Change area`}
        className="flex min-h-14 w-full items-center gap-3 rounded-full bg-white py-2 pl-5 pr-2 sm:min-w-[26rem] text-left text-gray-900 shadow-lg ring-4 ring-white/15 transition hover:ring-white/30"
      >
        <span aria-hidden className="text-lg">📍</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500">Area · አካባቢ</span>
          <span className="block text-base font-bold sm:text-lg">{name}</span>
        </span>
        <span className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-door px-3 py-2.5 text-sm font-semibold sm:px-4">
          {switching ? <Spinner className="h-3 w-3" /> : null}
          Change <span aria-hidden>▾</span>
        </span>
      </button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Area: ${name}. Change area`}
        className="flex min-h-10 items-center gap-2 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-sm hover:border-brand"
      >
        <span aria-hidden>📍</span>
        <span className="font-semibold">{name}</span>
        <span className="flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">
          {switching ? <Spinner className="h-2.5 w-2.5" /> : null}
          Change <span aria-hidden>▾</span>
        </span>
      </button>
    );

  return (
    <div ref={box} className={variant === "hero" ? "relative w-full sm:w-auto" : "relative"}>
      {button}
      {open && (
        <ul
          role="listbox"
          aria-label="Choose your area"
          className="absolute left-0 top-full z-40 mt-2 max-h-[70vh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-2xl"
        >
          <li className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-muted">Metro areas · አካባቢዎች</li>
          {regions.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                role="option"
                aria-selected={r.id === current}
                onClick={() => choose(r.id)}
                className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm hover:bg-brand-soft ${
                  r.id === current ? "font-semibold text-brand" : "font-semibold"
                }`}
              >
                <span>
                  {r.name}
                  <span className="block text-xs font-normal text-muted">
                    {r.cities.slice(0, 3).join(", ")} and nearby cities
                  </span>
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
