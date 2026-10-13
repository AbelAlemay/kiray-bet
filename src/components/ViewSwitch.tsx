"use client";

import { useState, type ReactNode } from "react";

// Two or more views of the same thing (e.g. List / Map) with a switch above them.
// Only the chosen view is rendered, so a map isn't loaded until someone asks for it.
export function ViewSwitch({
  label,
  options,
  views,
  actions,
}: {
  label: string;
  options: string[];
  views: ReactNode[];
  // Extra content on the right of the switch row (e.g. a "See all" link).
  actions?: ReactNode;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label={label} className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          {options.map((option, i) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`min-h-10 whitespace-nowrap rounded-lg px-4 text-sm font-semibold ${
                i === active ? "bg-brand text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {actions}
      </div>
      <div role="tabpanel">{views[active]}</div>
    </div>
  );
}
