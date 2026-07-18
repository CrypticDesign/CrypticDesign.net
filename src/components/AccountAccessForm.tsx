"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function AccountAccessForm({ mode }: { mode: "create" | "sign-in" }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [serviceMode, setServiceMode] = useState<"supabase" | "sandbox" | "disabled">("disabled");
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [message, setMessage] = useState("Checking account status…");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/membership/session").then((response) => response.json()).then((data) => {
      setAuthenticated(Boolean(data.authenticated));
      setServiceMode(data.mode ?? "disabled");
      setMessage(data.authenticated ? "You are signed in." : "Enter your account details.");
    }).catch(() => setMessage("Account status could not be checked.")).finally(() => setStatusLoaded(true));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(mode === "create" ? "Creating your account…" : "Signing you in…");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/membership/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: mode, email: form.get("email"), password: form.get("password"), displayName: form.get("displayName") }),
      });
      const payload = await response.json();
      setAuthenticated(Boolean(payload.authenticated));
      setServiceMode(payload.mode ?? serviceMode);
      setMessage(payload.message ?? payload.error ?? (payload.authenticated ? "You are signed in." : "Check your email to confirm your account."));
    } catch {
      setMessage("Account services could not be reached. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    try {
      const response = await fetch("/api/membership/session", { method: "DELETE" });
      const payload = await response.json();
      setAuthenticated(false);
      setMessage(payload.message ?? "You are signed out.");
    } catch {
      setMessage("Sign-out could not be completed. Please try again.");
    }
  }

  if (!statusLoaded) return <p className="ui-loading" aria-busy="true">Checking account status…</p>;

  if (authenticated) return (
    <section className="panel flex max-w-xl flex-col items-start gap-4 p-5">
      <span className="eyebrow">Account active</span>
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <div className="flex flex-wrap gap-3">
        <Link href="/account/create-character" className="button">Open Character Forge</Link>
        <button className="button secondary" type="button" onClick={signOut}>Sign out</button>
      </div>
    </section>
  );

  if (serviceMode === "sandbox") return (
    <section className="panel max-w-xl p-5">
      <span className="eyebrow">Local sandbox</span>
      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">Real account services are not configured in this environment.</p>
    </section>
  );

  if (serviceMode === "disabled") return (
    <section className="panel max-w-xl p-5">
      <span className="eyebrow">Account services unavailable</span>
      <p className="my-4 text-sm text-muted-foreground" aria-live="polite">Account services are not configured in this environment.</p>
    </section>
  );

  return (
    <form onSubmit={submit} className="panel flex max-w-xl flex-col gap-4 p-5">
      <span className="eyebrow">{mode === "create" ? "Free member account" : "Member access"}</span>
      {mode === "create" ? <label className="flex flex-col gap-2 text-sm">Display name<input name="displayName" required minLength={1} maxLength={80} autoComplete="name" /></label> : null}
      <label className="flex flex-col gap-2 text-sm">Email<input name="email" type="email" required autoComplete="email" /></label>
      <label className="flex flex-col gap-2 text-sm">Password<input name="password" type="password" required minLength={8} autoComplete={mode === "create" ? "new-password" : "current-password"} /></label>
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <button className="button self-start" type="submit" disabled={saving}>{saving ? "Working…" : mode === "create" ? "Create free account" : "Sign in"}</button>
    </form>
  );
}
