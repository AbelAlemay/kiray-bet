"use client";

import { useTransition } from "react";
import { setLanguage } from "@/lib/lang-actions";
import { useT } from "./LangProvider";
import { Spinner } from "./Pending";

// "English | አማርኛ" switch. The page reloads in the chosen language at the same address.
export function LangSwitch({ className = "" }: { className?: string }) {
  const t = useT();
  const [switching, start] = useTransition();

  function choose(lang: "en" | "am") {
    if (lang === t.lang) return;
    start(async () => {
      await setLanguage(lang);
      window.location.reload();
    });
  }

  return (
    <div role="group" aria-label={t("Language", "ቋንቋ")} className={`flex items-center rounded-full border border-border p-0.5 text-sm ${className}`}>
      {(
        [
          ["en", "English"],
          ["am", "አማርኛ"],
        ] as const
      ).map(([lang, label]) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          onClick={() => choose(lang)}
          aria-pressed={t.lang === lang}
          className={`flex min-h-9 items-center gap-1 rounded-full px-3 font-semibold ${
            t.lang === lang ? "bg-brand text-white" : "text-muted hover:text-foreground"
          }`}
        >
          {switching && t.lang !== lang && <Spinner className="h-3 w-3" />}
          {label}
        </button>
      ))}
    </div>
  );
}
