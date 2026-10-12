"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

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

// For forms: `waiting` is true until the bot check has produced a token.
export function useBotCheck() {
  const [token, setToken] = useState("");
  return { waiting: !!siteKey && !token, onToken: setToken };
}

export function Turnstile({ resetKey, onToken }: { resetKey?: unknown; onToken?: (token: string) => void }) {
  const box = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState("");
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
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
      "error-callback": () => setToken(""),
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
