"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import TurnstileWidget from "@/components/TurnstileWidget";
import { announceMembershipSession } from "@/lib/membership-session-events";

export default function AccountAccessForm({ mode }: { mode: "create" | "sign-in" }) {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";
  const inputClassName = "min-h-11 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 text-[var(--text)]";
  const [authenticated, setAuthenticated] = useState(false);
  const [captchaResetCounter, setCaptchaResetCounter] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [accountCreationAvailable, setAccountCreationAvailable] = useState(false);
  const [serviceMode, setServiceMode] = useState<"supabase" | "sandbox" | "disabled">("disabled");
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [message, setMessage] = useState("Checking account status…");
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/membership/session").then((response) => response.json()).then((data) => {
      const nextMode = data.mode ?? "disabled";
      setAuthenticated(Boolean(data.authenticated));
      setServiceMode(nextMode);
      setAccountCreationAvailable(Boolean(data.accountCreationAvailable));
      setMessage(data.authenticated ? "You are signed in." : nextMode === "disabled" ? "Sign-in is unavailable in this preview." : "Enter your account details.");
    }).catch(() => setMessage("Account status could not be checked.")).finally(() => setStatusLoaded(true));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!turnstileSiteKey) {
      setMessage("Human verification is unavailable. Please try again later.");
      return;
    }
    if (!captchaToken) {
      setMessage("Complete human verification before continuing.");
      return;
    }
    setSaving(true);
    setMessage(mode === "create" ? "Creating your account…" : "Signing you in…");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/membership/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: mode, email: form.get("email"), password: form.get("password"), displayName: form.get("displayName"), captchaToken }),
      });
      const payload = await response.json();
      const nextAuthenticated = Boolean(payload.authenticated);
      setAuthenticated(nextAuthenticated);
      announceMembershipSession(nextAuthenticated);
      setServiceMode(payload.mode ?? serviceMode);
      setMessage(payload.message ?? payload.error ?? (payload.authenticated ? "You are signed in." : "Check your email to confirm your account."));
    } catch {
      setMessage("Account services could not be reached. Please try again.");
    } finally {
      setCaptchaResetCounter((value) => value + 1);
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      const response = await fetch("/api/membership/session", { method: "DELETE" });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "Sign-out could not be completed. Please try again.");
        return;
      }
      setAuthenticated(false);
      announceMembershipSession(false);
      setMessage(payload.message ?? "You are signed out.");
    } catch {
      setMessage("Sign-out could not be completed. Please try again.");
    }
  }

  async function startSandboxSession() {
    setSaving(true);
    setMessage("Starting a local test session…");
    try {
      const response = await fetch("/api/membership/session", { method: "POST" });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error ?? "The local test session could not be started.");
        return;
      }
      setAuthenticated(true);
      announceMembershipSession(true);
      setMessage("Local test account active.");
    } catch {
      setMessage("The local test session could not be started.");
    } finally {
      setSaving(false);
    }
  }

  if (!statusLoaded) return <p className="ui-loading account-access-card" aria-busy="true">Checking account status…</p>;

  if (authenticated) return (
    <section className="panel account-access-card flex flex-col items-start gap-4">
      <span className="eyebrow">Account active</span>
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/account/create-character" className="button">Open Character Forge</Link>
        <button className="button secondary" type="button" onClick={signOut}>Sign out</button>
      </div>
    </section>
  );

  if (mode === "create" && !accountCreationAvailable) return (
    <section className="panel account-access-card flex flex-col items-start gap-4">
      <div className="account-access-card__status"><span>New accounts</span><strong><i aria-hidden="true" /> Closed</strong></div>
      <span className="eyebrow">Invitation required</span>
      <p className="text-sm text-muted-foreground" aria-live="polite">
        New accounts are not open yet. You will need an invitation when they become available. Public pages and previews are still open to everyone.
      </p>
      <Link href="/entertainment" className="button secondary">Explore Entertainment</Link>
    </section>
  );

  return (
    <form onSubmit={submit} className="panel account-access-card flex flex-col gap-4">
      <span className="eyebrow">{mode === "create" ? "Create your account" : "Sign in to your account"}</span>
      {serviceMode === "disabled" ? (
        <div className="border border-amber-400/35 bg-amber-400/5 p-4">
          <strong className="text-sm text-amber-100">Account services unavailable</strong>
          <p className="mt-2 text-sm text-muted-foreground">Email and password fields are shown for layout review. Sign-in is not connected in this preview.</p>
        </div>
      ) : null}
      {serviceMode === "sandbox" ? (
        <div className="border border-cyan-400/35 bg-cyan-400/5 p-4">
          <strong className="text-sm text-cyan-100">Local test account</strong>
          <p className="mt-2 text-sm text-muted-foreground">Use a temporary account to test signed-in features. No account is created and no credentials are sent.</p>
          <button className="button secondary mt-4" type="button" disabled={saving} onClick={startSandboxSession}>{saving ? "Starting…" : "Continue with local test account"}</button>
        </div>
      ) : null}
      {mode === "create" ? <label className="flex flex-col gap-2 text-sm">Display name<input className={inputClassName} name="displayName" required minLength={1} maxLength={80} autoComplete="name" /></label> : null}
      <label className="flex flex-col gap-2 text-sm">Email<input className={inputClassName} name="email" type="email" required autoComplete="email" /></label>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="account-password">Password</label>
          <button type="button" className="text-xs text-accent-cyan hover:underline" aria-controls="account-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide password" : "Show password"}</button>
        </div>
        <input id="account-password" className={inputClassName} name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete={mode === "create" ? "new-password" : "current-password"} />
      </div>
      {mode === "sign-in" ? <Link href="/account/recover" className="self-start text-sm text-accent-cyan hover:underline">Forgot password?</Link> : null}
      {serviceMode === "supabase" && turnstileSiteKey ? (
        <TurnstileWidget
          action={mode === "create" ? "account_create" : "account_signin"}
          onTokenChange={setCaptchaToken}
          resetCounter={captchaResetCounter}
          siteKey={turnstileSiteKey}
        />
      ) : serviceMode === "supabase" ? (
        <p role="alert" className="text-sm text-red-300">Human verification is not configured.</p>
      ) : null}
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <button className="button self-start" type="submit" disabled={saving || !captchaToken || serviceMode !== "supabase"}>{saving ? "Working…" : mode === "create" ? "Create account" : "Sign in"}</button>
    </form>
  );
}
