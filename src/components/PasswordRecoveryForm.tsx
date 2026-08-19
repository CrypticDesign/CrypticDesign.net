"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";

type ServiceMode = "supabase" | "sandbox" | "disabled";

export default function PasswordRecoveryForm() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const inputClassName = "min-h-11 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 text-[var(--text)]";
  const [mode, setMode] = useState<ServiceMode>("disabled");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaResetCounter, setCaptchaResetCounter] = useState(0);
  const [message, setMessage] = useState("Checking account services…");

  useEffect(() => {
    fetch("/api/membership/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        const nextMode = (payload.mode ?? "disabled") as ServiceMode;
        setMode(nextMode);
        setMessage(nextMode === "supabase"
          ? "Enter the email connected to your account."
          : nextMode === "sandbox"
            ? "Local test accounts do not have email, so they cannot receive a reset link."
            : "Recovery email is not connected in this preview.");
      })
      .catch(() => setMessage("Account services could not be reached."))
      .finally(() => setLoaded(true));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode !== "supabase" || !siteKey || !captchaToken) {
      setMessage(!siteKey ? "Human verification is unavailable. Please try again later." : "Complete human verification before continuing.");
      return;
    }
    setSaving(true);
    setMessage("Requesting a secure reset link…");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/membership/recovery", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), captchaToken }),
      });
      const payload = await response.json();
      setMessage(payload.message ?? payload.error ?? "If that email belongs to an account, a reset link is on its way.");
    } catch {
      setMessage("Recovery services could not be reached. Please try again.");
    } finally {
      setCaptchaResetCounter((value) => value + 1);
      setSaving(false);
    }
  }

  if (!loaded) return <p className="ui-loading account-access-card" aria-busy="true">Checking account services…</p>;

  return (
    <form onSubmit={submit} className="panel account-access-card flex flex-col gap-4">
      <span className="eyebrow">Email a reset link</span>
      {mode !== "supabase" ? (
        <div className="border border-amber-400/35 bg-amber-400/5 p-4">
          <strong className="text-sm text-amber-100">Account services unavailable</strong>
          <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        </div>
      ) : null}
      <label className="flex flex-col gap-2 text-sm">
        Email
        <input className={inputClassName} name="email" type="email" required autoComplete="email" />
      </label>
      {mode === "supabase" && siteKey ? (
        <TurnstileWidget action="password_recovery" onTokenChange={setCaptchaToken} resetCounter={captchaResetCounter} siteKey={siteKey} />
      ) : mode === "supabase" ? <p role="alert" className="text-sm text-red-300">Human verification is not configured.</p> : null}
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <div className="flex flex-wrap gap-3">
        <button className="button" type="submit" disabled={saving || mode !== "supabase" || !captchaToken}>{saving ? "Sending…" : "Send reset link"}</button>
        <Link href="/account/sign-in" className="button secondary">Return to sign in</Link>
      </div>
    </form>
  );
}
