"use client";

import { useLinkStatus } from "next/link";
import { useFormStatus } from "react-dom";

// Small round "working on it" indicator on the corner of a button or link, so a tap
// never looks frozen. Always rendered at a fixed size and faded in, so nothing shifts.
// The button or link needs the `relative` class.

export function Spinner({ className = "h-3 w-3" }: { className?: string }) {
  return <span aria-hidden className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />;
}

export function PendingCorner({ pending, position = "-right-1.5 -top-1.5" }: { pending: boolean; position?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute ${position} z-10 grid h-5 w-5 place-items-center rounded-full bg-surface text-brand shadow ring-1 ring-border transition-opacity duration-150 ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      {pending && <Spinner />}
    </span>
  );
}

// Inside a <Link>: shows while the next page is loading.
export function LinkPending({ position }: { position?: string }) {
  const { pending } = useLinkStatus();
  return <PendingCorner pending={pending} position={position} />;
}

// Inside a <form>'s submit button: shows while the form's action is running.
export function FormPending({ position }: { position?: string }) {
  const { pending } = useFormStatus();
  return <PendingCorner pending={pending} position={position} />;
}
