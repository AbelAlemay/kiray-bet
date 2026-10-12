"use client";

import { useState } from "react";

// A button that asks for confirmation inline (and optionally a note) before
// submitting a server action.
export function ConfirmButton({
  label,
  question,
  confirmLabel,
  action,
  fields,
  notePlaceholder,
  noteRequired = false,
  danger = false,
}: {
  label: string;
  question: string;
  confirmLabel: string;
  action: (formData: FormData) => Promise<void>;
  fields: Record<string, string>;
  notePlaceholder?: string;
  noteRequired?: boolean;
  danger?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const tone = danger ? "text-danger border-danger/40" : "border-border";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold hover:bg-brand-soft ${tone}`}>
        {label}
      </button>
    );
  }

  return (
    <form action={action} className={`w-full space-y-2 rounded-xl border p-3 text-sm ${danger ? "border-danger/40 bg-danger/5" : "border-border bg-brand-soft"}`}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <p className="font-semibold">{question}</p>
      {notePlaceholder && (
        <input
          name="note"
          required={noteRequired}
          maxLength={500}
          autoFocus
          placeholder={notePlaceholder}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2"
        />
      )}
      <div className="flex gap-2">
        <button className={`rounded-lg px-3 py-1.5 font-semibold text-white ${danger ? "bg-danger" : "bg-brand"} hover:opacity-90`}>
          {confirmLabel}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-border px-3 py-1.5 font-semibold hover:bg-surface">
          Cancel
        </button>
      </div>
    </form>
  );
}
