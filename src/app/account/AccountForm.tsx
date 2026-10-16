"use client";

import { useActionState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import type { CurrentUser } from "@/lib/auth";
import { updateAccount } from "./actions";
import { PendingCorner } from "@/components/Pending";

// `next` is set during first-time setup: saving then continues there.
export function AccountForm({ user, next }: { user: CurrentUser; next?: string }) {
  const [state, action, pending] = useActionState(updateAccount, {});

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className={labelClass}>
        <span>First name · ስም</span>
        <input
          name="name"
          defaultValue={state.name ?? user.name ?? ""}
          required
          autoFocus={!user.name}
          maxLength={40}
          autoComplete="given-name"
          className={fieldClass}
        />
        <span className="block text-xs font-normal text-muted">
          Only your first name is shown to others.
        </span>
      </label>
      <label className={labelClass}>
        <span>Language · ቋንቋ</span>
        <select name="language" defaultValue={state.language ?? user.language} className={fieldClass}>
          <option value="en">English</option>
          <option value="am">አማርኛ (Amharic)</option>
        </select>
      </label>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.saved && <p role="status" className="text-sm text-brand">Saved · ተቀምጧል</p>}
      <button disabled={pending} className={primaryButtonClass}>
        <PendingCorner pending={pending} />
        {pending ? "Saving…" : next ? "Continue · ይቀጥሉ" : "Save"}
      </button>
    </form>
  );
}
