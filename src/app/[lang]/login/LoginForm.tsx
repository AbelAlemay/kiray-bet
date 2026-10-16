"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { BotCheckFailed, Turnstile, useBotCheck } from "@/components/Turnstile";
import { emailSignIn, signInWithGoogle, type LoginState } from "./actions";
import { PendingCorner } from "@/components/Pending";
import { useT } from "@/components/LangProvider";

// Seconds left of a wait, counting down live. Give the component using it a new `key`
// for each result so it starts again from the new number.
function useCountdown(seconds = 0) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (seconds <= 0) return;
    const end = Date.now() + seconds * 1000;
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) clearInterval(timer);
    }, 250);
    return () => clearInterval(timer);
  }, [seconds]);
  return left;
}

function Countdown({ seconds, children }: { seconds?: number; children: (left: number) => ReactNode }) {
  return children(useCountdown(seconds));
}

const clock = (seconds: number) => `0:${String(seconds).padStart(2, "0")}`;

// An error message; a "wait a minute" error shows the seconds left and disappears at zero.
function ErrorMessage({ state, left }: { state: LoginState; left: number }) {
  const t = useT();
  if (!state.error) return null;
  const waiting = state.retryAfter !== undefined && state.perMinute;
  if (waiting && left === 0) return null;
  return (
    <p role="alert" className="text-sm text-danger">
      {state.error}
      {waiting && t(` Please try again in ${left} second${left === 1 ? "" : "s"}.`, ` እባክዎ ከ${left} ሰከንድ በኋላ እንደገና ይሞክሩ።`)}
    </p>
  );
}

export function LoginForm({ next, googleEnabled }: { next: string; googleEnabled: boolean }) {
  const [state, action, pending] = useActionState(emailSignIn, { step: "email" } as LoginState);
  const bot = useBotCheck();
  const t = useT();
  // New key per result, so countdowns restart from the latest number.
  const resultKey = JSON.stringify(state);

  if (state.step === "code") {
    return (
      <div className="space-y-5">
        <div className="rounded-xl bg-brand-soft p-4 text-sm">
          <p className="font-semibold">{t.both("Check your email", "ኢሜይልዎን ይመልከቱ")}</p>
          {t.lang === "am" ? (
            <p className="mt-1">
              ባለ 6 አሃዝ ኮድና የመግቢያ ቁልፍ ወደ <strong>{state.email}</strong> ልከናል። ኮዱን ከታች
              ያስገቡ ወይም በኢሜይሉ ውስጥ ያለውን ቁልፍ ይንኩ።
            </p>
          ) : (
            <p className="mt-1">
              We sent a 6-digit code and a sign-in button to <strong>{state.email}</strong>.
              Enter the code below, or tap the button in the email.
            </p>
          )}
        </div>
        <Countdown key={resultKey} seconds={state.retryAfter}>
          {(left) => (
            <>
              <form action={action} className="space-y-4">
                <input type="hidden" name="intent" value="verify" />
                <input type="hidden" name="next" value={next} />
                <label className={labelClass}>
                  <span>{t.both("6-digit code", "ኮድ")}</span>
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
                <ErrorMessage state={state} left={left} />
                <button disabled={pending} className={primaryButtonClass}>
                  <PendingCorner pending={pending} />
                  {pending ? t("Checking…", "በማረጋገጥ ላይ…") : t.both("Sign in", "ይግቡ")}
                </button>
              </form>
              <form action={action} className="text-center text-sm text-muted">
                <input type="hidden" name="email" value={state.email} />
                <input type="hidden" name="next" value={next} />
                <Turnstile resetKey={state} onToken={bot.onToken} onError={bot.onError} onInteractive={bot.onInteractive} />
                {t("Didn't get it? Check spam, or", "አልደረሰዎትም? የስፓም ሳጥኑን ይመልከቱ፣ ወይም")}{" "}
                <button
                  disabled={pending || bot.waiting || left > 0}
                  className="font-semibold text-brand hover:underline disabled:text-muted disabled:no-underline"
                >
                  {left > 0
                    ? t(`send a new code in ${clock(left)}`, `ከ${clock(left)} በኋላ አዲስ ኮድ ያስልኩ`)
                    : t("send a new code", "አዲስ ኮድ ያስልኩ")}
                </button>
                {" · "}
                <button name="intent" value="restart" className="font-semibold text-brand hover:underline">
                  {t("use another email", "ሌላ ኢሜይል ይጠቀሙ")}
                </button>
              </form>
            </>
          )}
        </Countdown>
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
              <span aria-hidden className="font-bold text-[#4285F4]">G</span> {t("Continue with Google", "በGoogle ይቀጥሉ")}
            </button>
          </form>
          <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            {t.both("or", "ወይም")}
          </p>
        </>
      )}
      <form action={action} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <Turnstile resetKey={state} onToken={bot.onToken} onError={bot.onError} onInteractive={bot.onInteractive} />
        <label className={labelClass}>
          <span>{t.both("Email", "ኢሜይል")}</span>
          <input
            name="email"
            type="email"
            defaultValue={state.email}
            autoComplete="email"
            required
            placeholder="you@example.com"
            className={fieldClass}
          />
        </label>
        <Countdown key={resultKey} seconds={state.retryAfter}>
          {(left) => (
            <>
              <ErrorMessage state={state} left={left} />
              {bot.failed && <BotCheckFailed />}
              <button disabled={pending || bot.waiting || left > 0} className={primaryButtonClass}>
                <PendingCorner pending={pending} />
                {pending
                  ? t("Sending…", "በመላክ ላይ…")
                  : left > 0
                    ? t(`Wait ${clock(left)}`, `${clock(left)} ይጠብቁ`)
                    : bot.waiting
                      ? bot.waitingLabel
                      : t("Email me a sign-in code", "የመግቢያ ኮድ በኢሜይል ይላክልኝ")}
              </button>
            </>
          )}
        </Countdown>
        <p className="text-xs text-muted">
          {t(
            "First time here? This code also creates your free account. We never show your email to other users and never ask for your phone number.",
            "ለመጀመሪያ ጊዜ ነው? ይህ ኮድ ነጻ መለያዎንም ይፈጥራል። ኢሜይልዎን ለሌሎች ተጠቃሚዎች በፍጹም አናሳይም፤ ስልክ ቁጥርዎንም አንጠይቅም።",
          )}
        </p>
      </form>
    </div>
  );
}
