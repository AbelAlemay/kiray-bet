"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { useT } from "./LangProvider";

// Cloudflare Turnstile bot check. Invisible unless Cloudflare wants a click. Puts its
// token in a hidden "turnstileToken" field of the surrounding form. Tokens work once,
// so pass a changing `resetKey` (e.g. the form's last result) to get a fresh one.
// The token takes about a second to arrive: forms should wait for `onToken` (see
// useBotCheck) before allowing submit, or the server will reject the request.

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// For forms: `waiting` is true until the bot check has produced a token; `failed` when
// Cloudflare couldn't run the check (blocked script, unknown site address, offline).
export function useBotCheck() {
  const [token, setToken] = useState("");
  const [failed, setFailed] = useState(false);
  // Cloudflare occasionally asks for a click ("Verify you are human").
  const [needsClick, setNeedsClick] = useState(false);
  const t = useT();
  const waiting = !!siteKey && !token;
  return {
    waiting,
    failed,
    // Button label while waiting.
    waitingLabel: needsClick
      ? t("Tick the box above to continue", "ለመቀጠል ከላይ ያለውን ሳጥን ምልክት ያድርጉ")
      : t("Checking your browser…", "አሳሽዎን በማረጋገጥ ላይ…"),
    onToken: (value: string) => {
      setToken(value);
      if (value) {
        setFailed(false);
        setNeedsClick(false);
      }
    },
    onError: () => setFailed(true),
    onInteractive: () => setNeedsClick(true),
  };
}

export function Turnstile({
  resetKey,
  onToken,
  onError,
  onInteractive,
}: {
  resetKey?: unknown;
  onToken?: (token: string) => void;
  onError?: () => void;
  onInteractive?: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState("");
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  const onInteractiveRef = useRef(onInteractive);
  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
    onInteractiveRef.current = onInteractive;
  });
  const setToken = (value: string) => {
    setTokenState(value);
    onTokenRef.current?.(value);
  };

  useEffect(() => {
    if (!siteKey || !ready || !box.current || !window.turnstile) return;
    widget.current = window.turnstile.render(box.current, {
      sitekey: siteKey,
      appearance: "interaction-only",
      callback: setToken,
      "expired-callback": () => setToken(""),
      "before-interactive-callback": () => onInteractiveRef.current?.(),
      "error-callback": () => {
        setToken("");
        onErrorRef.current?.();
      },
    });
    return () => {
      if (widget.current) window.turnstile?.remove(widget.current);
      widget.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (widget.current && resetKey !== undefined) {
      setToken("");
      window.turnstile?.reset(widget.current);
    }
  }, [resetKey]);

  if (!siteKey) return null;
  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setReady(true)}
      />
      <div ref={box} />
      <input type="hidden" name="turnstileToken" value={token} />
    </>
  );
}

// Shown when the bot check couldn't run, instead of "Checking your browser…" forever.
export function BotCheckFailed() {
  const t = useT();
  return (
    <p role="alert" className="text-sm text-danger">
      {t(
        "Our quick safety check couldn't load. Please refresh the page. If it keeps happening, try another browser or turn off ad blockers for this site.",
        "አጭሩ የደህንነት ፍተሻችን መጫን አልቻለም። እባክዎ ገጹን ያድሱ። ችግሩ ከቀጠለ ሌላ አሳሽ ይሞክሩ ወይም ለዚህ ድረ-ገጽ የማስታወቂያ ማገጃዎችን ያጥፉ።",
      )}
    </p>
  );
}
