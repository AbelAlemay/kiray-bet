"use client";

import { useActionState, useState } from "react";
import { primaryButtonClass } from "@/components/form-styles";
import { messageWarning, warningText } from "@/lib/message-safety";
import { startConversation } from "../actions";

export function StartForm({ listingId, hostName }: { listingId: string; hostName: string }) {
  const [state, action, pending] = useActionState(startConversation, {});
  const [body, setBody] = useState("Hi! Is this home still available? I'd like to know more.");
  const warning = messageWarning(body);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <label className="block space-y-1 text-sm font-medium">
        <span>Your message to {hostName}</span>
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={4000}
          rows={5}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 outline-none focus:border-brand"
        />
      </label>
      {warning && <p className="rounded-xl border border-accent/60 bg-accent/10 p-3 text-sm">⚠ {warningText[warning]}</p>}
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button disabled={pending || !body.trim()} className={primaryButtonClass}>
        {pending ? "Sending…" : "Send message · ይላኩ"}
      </button>
      <p className="text-xs text-muted">
        🔒 {hostName} sees your first name only, never your email. You can keep the whole
        conversation here.
      </p>
    </form>
  );
}
