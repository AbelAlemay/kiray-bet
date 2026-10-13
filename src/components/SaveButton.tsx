"use client";

import { useSaved } from "./SavedProvider";

// ♡ Save toggle. "heart" sits on a listing card's photo; "button" is the full-width
// button on a listing page.
export function SaveButton({ listingId, variant }: { listingId: string; variant: "heart" | "button" }) {
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(listingId);
  const label = saved ? "Remove from saved homes" : "Save this home";

  if (variant === "heart") {
    return (
      <button
        type="button"
        onClick={() => toggle(listingId)}
        aria-pressed={saved}
        aria-label={label}
        title={label}
        className="grid h-11 w-11 place-items-center rounded-full bg-black/55 text-xl text-white backdrop-blur hover:bg-black/70"
      >
        <span aria-hidden className={saved ? "text-door" : ""}>
          {saved ? "♥" : "♡"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(listingId)}
      aria-pressed={saved}
      className={`block w-full rounded-xl border px-4 py-3 text-center font-semibold ${
        saved ? "border-door/60 bg-door/10 text-door" : "border-border hover:bg-brand-soft"
      }`}
    >
      {saved ? "♥ Saved · ተቀምጧል" : "♡ Save"}
    </button>
  );
}
