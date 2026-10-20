"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLanguage } from "@/lib/lang-actions";
import { useT } from "./LangProvider";

// "English | አማርኛ" switch. The chosen side lights up at once, then the page re-renders in
// that language in place (same address, scroll position kept, no full reload).
// `small` (phone header): "EN | አማ" in a compact pill.
export function LangSwitch({ className = "", small = false }: { className?: string; small?: boolean }) {
  const t = useT();
  const router = useRouter();
  const [, start] = useTransition();
  const [shown, setShown] = useOptimistic(t.lang);

  function choose(lang: "en" | "am") {
    if (lang === shown) return;
    start(async () => {
      setShown(lang);
      await setLanguage(lang);
      router.refresh();
    });
  }

  const options = small
    ? ([["en", "EN", "English"], ["am", "አማ", "አማርኛ"]] as const)
    : ([["en", "English", "English"], ["am", "አማርኛ", "አማርኛ"]] as const);

  return (
    <div
      role="group"
      aria-label={t("Language", "ቋንቋ")}
      className={`flex items-center rounded-full border border-border p-0.5 ${small ? "text-xs" : "text-sm"} ${className}`}
    >
      {options.map(([lang, label, full]) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          onClick={() => choose(lang)}
          aria-pressed={shown === lang}
          aria-label={small ? full : undefined}
          className={`flex items-center rounded-full font-semibold transition-colors duration-200 ${
            small ? "min-h-8 min-w-9 justify-center px-2 max-[399px]:min-w-8 max-[399px]:px-1.5" : "min-h-9 px-3"
          } ${shown === lang ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
