"use client";

import { useActionState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { Turnstile, useBotCheck } from "@/components/Turnstile";
import { emailSignIn, signInWithGoogle, type LoginState } from "./actions";

export function LoginForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const [state, action, pending] = useActionState(emailSignIn, { step: "email" } as LoginState);
  const bot = useBotCheck();

  if (state.step === "code") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-soft p-4 text-sm">
          <p className="font-semibold">Check your email · ኢሜይልዎን ይመልከቱ</p>
          <p className="mt-1">
            We sent a 6-digit code and a sign-in button to <strong>{state.email}</strong>.
            Enter the code below, or tap the button in the email.
          </p>
        </div>
        <form action={action} className="space-y-4">
          <input type="hidden" name="intent" value="verify" />
          <input type="hidden" name="next" value={next} />
          <label className={labelClass}>
            <span>6-digit code · ኮድ</span>
            <input
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              required
              autoFocus
              className={`${fieldClass} text-center text-2xl tracking-[0.4em]`}
            />
          </label>
          {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
          <button disabled={pending} className={primaryButtonClass}>
            {pending ? "Checking…" : "Sign in · ይግቡ"}
          </button>
        </form>
        <form action={action} className="text-center text-sm text-muted">
          <input type="hidden" name="email" value={state.email} />
          <input type="hidden" name="next" value={next} />
          <Turnstile resetKey={state} onToken={bot.onToken} />
          Didn&apos;t get it? Check spam, or{" "}
          <button disabled={pending || bot.waiting} className="font-semibold text-brand hover:underline disabled:opacity-60">
            send a new code
          </button>
          {" · "}
          <button name="intent" value="restart" className="font-semibold text-brand hover:underline">
            use another email
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {googleEnabled && (
        <>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 font-semibold hover:bg-brand-soft">
              <span aria-hidden className="font-bold text-[#4285F4]">G</span> Continue with Google
            </button>
          </form>
          <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            or · ወይም
          </p>
        </>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Turnstile resetKey={state} onToken={bot.onToken} />
        <label className={labelClass}>
          <span>Email · ኢሜይል</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        <button disabled={pending || bot.waiting} className={primaryButtonClass}>
          {pending ? "Sending…" : bot.waiting ? "Checking your browser…" : "Email me a sign-in code"}
        </button>
        <p className="text-xs text-muted">
          No password needed. New here? This creates your account. We never show your email to
          other users and never ask for your phone number.
        </p>
      </form>
    </div>
  );
}
