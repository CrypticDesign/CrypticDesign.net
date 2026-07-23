"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "interaction-only";
      callback: (token: string) => void;
      "error-callback": () => void;
      "expired-callback": () => void;
      size: "flexible";
      theme: "dark";
    },
  ) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

export default function TurnstileWidget({
  action,
  onTokenChange,
  resetCounter,
  siteKey,
}: {
  action: "account_create" | "account_signin";
  onTokenChange: (token: string | null) => void;
  resetCounter: number;
  siteKey: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const widgetIdRef = useRef<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    const turnstile = window.turnstile;
    const container = containerRef.current;
    if (!scriptReady || !turnstile || !container || widgetIdRef.current) return;

    widgetIdRef.current = turnstile.render(container, {
      sitekey: siteKey,
      action,
      appearance: "interaction-only",
      callback: (token) => onTokenChangeRef.current(token),
      "error-callback": () => onTokenChangeRef.current(null),
      "expired-callback": () => onTokenChangeRef.current(null),
      size: "flexible",
      theme: "dark",
    });

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [action, scriptReady, siteKey]);

  useEffect(() => {
    if (!resetCounter || !widgetIdRef.current || !window.turnstile) return;
    window.turnstile.reset(widgetIdRef.current);
    onTokenChangeRef.current(null);
  }, [resetCounter]);

  return (
    <div className="flex flex-col gap-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => onTokenChangeRef.current(null)}
      />
      <div ref={containerRef} className="min-h-[65px] w-full" />
      <p className="text-xs text-muted-foreground">
        Protected by Cloudflare Turnstile. Complete human verification to continue.
      </p>
    </div>
  );
}
