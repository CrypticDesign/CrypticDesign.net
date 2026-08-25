"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { announceMembershipSession } from "@/lib/membership-session-events";

export default function PasswordResetForm() {
  const inputClassName = "min-h-11 w-full border border-[var(--line)] bg-[var(--canvas)] px-3 py-3 text-[var(--text)]";
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("Choose a password you do not use on another site.");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("Changing your password…");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/membership/password", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password: form.get("password"), confirmation: form.get("confirmation") }),
      });
      const payload = await response.json();
      setMessage(payload.message ?? payload.error ?? "Your password could not be changed.");
      if (response.ok) {
        setComplete(true);
        announceMembershipSession(true);
      }
    } catch {
      setMessage("Password services could not be reached. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (complete) return (
    <section className="panel account-access-card flex flex-col items-start gap-4">
      <span className="eyebrow">Password changed</span>
      <h2 className="text-2xl font-semibold">You are ready to continue.</h2>
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <Link href="/account" className="button">Open your account</Link>
    </section>
  );

  return (
    <form onSubmit={submit} className="panel account-access-card flex flex-col gap-4">
      <span className="eyebrow">Choose a new password</span>
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor="new-password">New password</label>
          <button type="button" className="inline-flex min-h-11 items-center text-xs text-accent-cyan hover:underline" aria-controls="new-password password-confirmation" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? "Hide passwords" : "Show passwords"}</button>
        </div>
        <input id="new-password" className={inputClassName} name="password" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" />
      </div>
      <label className="flex flex-col gap-2 text-sm">
        Confirm new password
        <input id="password-confirmation" className={inputClassName} name="confirmation" type={showPassword ? "text" : "password"} required minLength={8} autoComplete="new-password" />
      </label>
      <p className="text-sm text-muted-foreground" aria-live="polite">{message}</p>
      <button className="button self-start" type="submit" disabled={saving}>{saving ? "Changing…" : "Change password"}</button>
    </form>
  );
}
