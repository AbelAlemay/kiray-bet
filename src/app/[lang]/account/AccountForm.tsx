"use client";

import { useActionState, useEffect } from "react";
import { useT } from "@/components/LangProvider";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import type { CurrentUser } from "@/lib/auth";
import { updateAccount } from "./actions";
import { PendingCorner } from "@/components/Pending";

// `next` is set during first-time setup: saving then continues there.
export function AccountForm({ user, next }: { user: CurrentUser; next?: string }) {
  const [state, action, pending] = useActionState(updateAccount, {});
  const t = useT();
  // A new language shows the whole site in it.
  useEffect(() => {
    if (state.saved && state.language && state.language !== t.lang) window.location.reload();
  }, [state, t.lang]);

  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className={labelClass}>
        <span>{t.both("First name", "ስም")}</span>
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
          {t("Only your first name is shown to others.", "ለሌሎች የሚታየው የመጀመሪያ ስምዎ ብቻ ነው።")}
        </span>
      </label>
      <label className={labelClass}>
        <span>{t.both("Language", "ቋንቋ")}</span>
        <select name="language" defaultValue={state.language ?? user.language} className={fieldClass}>
          <option value="en">English</option>
          <option value="am">አማርኛ (Amharic)</option>
        </select>
      </label>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      {state.saved && <p role="status" className="text-sm text-brand">{t.both("Saved", "ተቀምጧል")}</p>}
      <button disabled={pending} className={primaryButtonClass}>
        <PendingCorner pending={pending} />
        {pending ? t("Saving…", "በማስቀመጥ ላይ…") : next ? t.both("Continue", "ይቀጥሉ") : t("Save", "አስቀምጥ")}
      </button>
    </form>
  );
}
