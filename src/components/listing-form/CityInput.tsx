"use client";

import { useId, useRef, useState } from "react";
import { fieldClass } from "@/components/form-styles";
import { regions } from "@/lib/regions";

// City box with suggestions from our areas in the chosen state, styled like the site
// (the browser's own <datalist> popup is unstyled and lists every state's cities).
// Any city can still be typed; the address lookup decides the final city name.
export function CityInput({ state, defaultValue = "" }: { state: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const inState = [...new Set(regions.filter((r) => (r.states as readonly string[]).includes(state)).flatMap((r) => r.cities))].sort();
  const typed = value.trim().toLowerCase();
  const matches = inState
    .filter((c) => !typed || c.toLowerCase().includes(typed))
    .filter((c) => c.toLowerCase() !== typed)
    .slice(0, 8);
  const showList = open && matches.length > 0;

  const choose = (city: string) => {
    setValue(city);
    setOpen(false);
    setActive(-1);
  };

  return (
    <div className="relative">
      <input
        name="city"
        required
        maxLength={60}
        autoComplete="off"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        // Short delay so a tap on a suggestion lands before the list closes.
        onBlur={() => {
          closeTimer.current = setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % matches.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(matches[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className={fieldClass}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-border bg-surface py-1 shadow-lg"
        >
          {matches.map((city, i) => (
            <li
              key={city}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                // The field sits inside a <label>; don't let the click refocus and reopen.
                e.preventDefault();
                clearTimeout(closeTimer.current);
                choose(city);
              }}
              className={`cursor-pointer px-4 py-2.5 ${i === active ? "bg-brand-soft text-brand" : "hover:bg-brand-soft"}`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
