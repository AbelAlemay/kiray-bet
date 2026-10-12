"use client";

import { useActionState } from "react";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/form-styles";
import { twoStep, type TwoStepState } from "./actions";

export function TwoStepForm({ initial }: { initial: TwoStepState }) {
  const [state, action, pending] = useActionState(twoStep, initial);

  if (state.step === "start") {
    return (
      <form action={action} className="space-y-4">
        <p className="text-sm">
          Admin access needs two-step login: after signing in, you also enter a code from an
          authenticator app on your phone (Google Authenticator, Authy, 1Password…). This keeps
          the admin account safe even if your email is compromised.
        </p>
        {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
        <button name="intent" value="enroll" disabled={pending} className={primaryButtonClass}>
          {pending ? "Starting…" : "Set up two-step login"}
        </button>
      </form>
    );
  }

  const qrSrc =
    state.step === "scan" && (state.qr.startsWith("data:") ? state.qr : `data:image/svg+xml;utf-8,${encodeURIComponent(state.qr)}`);

  return (
    <form action={action} className="space-y-4">
      {state.step === "scan" && qrSrc && (
        <div className="space-y-3 text-sm">
          <p>1. In your authenticator app, add an account and scan this code:</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- QR code as an inline SVG data URL */}
          <img src={qrSrc} alt="QR code for your authenticator app" className="h-48 w-48 rounded-lg bg-white p-2" />
          <p className="text-muted">
            Can&apos;t scan? Enter this key instead: <code className="break-all font-mono">{state.secret}</code>
          </p>
          <p>2. Enter the 6-digit code the app shows:</p>
        </div>
      )}
      <label className={labelClass}>
        <span>Code from your authenticator app</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={7}
          required
          autoFocus
          className={`${fieldClass} text-center text-2xl tracking-[0.4em]`}
        />
      </label>
      {state.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className={primaryButtonClass}>
        {pending ? "Checking…" : "Confirm"}
      </button>
    </form>
  );
}
