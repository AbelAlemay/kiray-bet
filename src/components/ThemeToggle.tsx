"use client";

import { useSyncExternalStore } from "react";

// Day/night switch. Starts from the device setting; the choice is saved in this
// browser and applied before paint by the script in layout.tsx.

type Theme = "light" | "dark";

function currentTheme(): Theme {
  const chosen = document.documentElement.getAttribute("data-theme");
  if (chosen === "light" || chosen === "dark") return chosen;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const media = matchMedia("(prefers-color-scheme: dark)");
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

export function ThemeToggle() {
  // null on the server, where the theme isn't known yet.
  const theme = useSyncExternalStore<Theme | null>(subscribe, currentTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.setAttribute("data-theme", next);
        try {
          localStorage.setItem("theme", next);
        } catch {}
      }}
      aria-label={theme ? `Switch to ${next === "dark" ? "night" : "day"} mode` : "Switch day/night mode"}
      title={theme ? `Switch to ${next === "dark" ? "night" : "day"} mode` : undefined}
      className="grid h-9 w-9 place-items-center rounded-lg border border-border text-base hover:bg-brand-soft"
    >
      <span aria-hidden className={theme ? "" : "invisible"}>
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
