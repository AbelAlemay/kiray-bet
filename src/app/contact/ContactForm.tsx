"use client";

import { useActionState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { Turnstile, useBotCheck } from "@/components/Turnstile";
import { sendContactMessage } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContactMessage, {});
  const bot = useBotCheck();

  if (state.sent) {
    return (
      <div role="status" className="rounded-2xl bg-brand-soft p-6">
        <p className="font-semibold">Thank you! Your message was sent. · መልዕክትዎ ተልኳል</p>
        <p className="mt-1 text-sm">We&apos;ll reply by email, usually within a day or two.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          <span>Your name · ስም</span>
          <input name="name" required maxLength={60} autoComplete="name" className={fieldClass} />
        </label>
        <label className={labelClass}>
          <span>Email (for our reply) · ኢሜይል</span>
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </div>
      <label className={labelClass}>
        <span>Topic</span>
        <select name="topic" className={fieldClass}>
          <option>General question</option>
          <option>Problem with the site</option>
          <option>Report a listing or user</option>
          <option>Partnership</option>
        </select>
      </label>
      <label className={labelClass}>
        <span>Message · መልዕክት</span>
        <textarea name="message" required minLength={10} maxLength={3000} rows={6} className={fieldClass} />
      </label>
      <Turnstile resetKey={state} onToken={bot.onToken} />
      {state.error && (
        <p role="alert" className="text-sm text-danger">
          {state.error}
        </p>
      )}
      <button disabled={pending || bot.waiting} className={primaryButtonClass}>
        {pending ? "Sending…" : bot.waiting ? "Checking your browser…" : "Send message · ይላኩ"}
      </button>
    </form>
  );
}
