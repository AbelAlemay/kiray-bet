"use client";

import { useActionState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { BotCheckFailed, Turnstile, useBotCheck } from "@/components/Turnstile";
import { sendContactMessage } from "./actions";
import { PendingCorner } from "@/components/Pending";
import { useT } from "@/components/LangProvider";

const topics = [
  ["General question", "አጠቃላይ ጥያቄ"],
  ["Problem with the site", "የድረ-ገጹ ችግር"],
  ["Report a listing or user", "ማስታወቂያን ወይም ተጠቃሚን ሪፖርት ማድረግ"],
  ["Partnership", "አጋርነት"],
] as const;

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, {});
  const bot = useBotCheck();
  const t = useT();

  if (state.sent) {
    return (
      <div role="status" className="rounded-2xl bg-brand-soft p-6">
        <p className="font-semibold">{t.both("Thank you! Your message was sent.", "እናመሰግናለን! መልዕክትዎ ተልኳል።")}</p>
        <p className="mt-1 text-sm">
          {t("We'll reply by email, usually within a day or two.", "ብዙውን ጊዜ በአንድ ወይም በሁለት ቀን ውስጥ በኢሜይል እንመልሳለን።")}
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>{t.both("Your name", "ስም")}</span>
          <input name="name" required maxLength={60} autoComplete="name" className={fieldClass} />
        </label>
        <label className={labelClass}>
          <span>{t.both("Email (for our reply)", "ኢሜይል (ለመልሳችን)")}</span>
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </div>
      <label className={labelClass}>
        <span>{t("Topic", "ርዕስ")}</span>
        <select name="topic" className={fieldClass}>
          {topics.map(([en, am]) => (
            <option key={en} value={en}>
              {t(en, am)}
            </option>
          ))}
        </select>
      </label>
      <label className={labelClass}>
        <span>{t.both("Message", "መልዕክት")}</span>
        <textarea name="message" required minLength={10} maxLength={3000} rows={6} className={fieldClass} />
      </label>
      <Turnstile resetKey={state} onToken={bot.onToken} onError={bot.onError} onInteractive={bot.onInteractive} />
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      {bot.failed && <BotCheckFailed />}
      <button disabled={pending || bot.waiting} className={primaryButtonClass}>
        <PendingCorner pending={pending} />
        {pending ? t("Sending…", "በመላክ ላይ…") : bot.waiting ? bot.waitingLabel : t.both("Send message", "ይላኩ")}
      </button>
    </form>
  );
}
