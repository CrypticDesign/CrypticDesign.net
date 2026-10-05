"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import styles from "./operator-console.module.css";

type TotpFactor = { id: string; friendlyName: string };

export default function OperatorStepUpPanel({ csrfToken }: { csrfToken: string }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [factors, setFactors] = useState<TotpFactor[]>([]);
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("Loading verified TOTP factors…");

  useEffect(() => {
    let active = true;
    void import("@/lib/supabase/browser")
      .then(({ createBrowserSupabaseClient }) => {
        if (active) setSupabase(createBrowserSupabaseClient());
      })
      .catch(() => {
        if (active) setStatus("Supabase authentication is not configured.");
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    async function loadFactors() {
      if (!supabase) return;
      const result = await supabase.auth.mfa.listFactors();
      if (!active) return;
      if (result.error) {
        setStatus("Verified TOTP factors are unavailable.");
        return;
      }
      const verified = result.data.totp.map((factor, index) => ({
        id: factor.id,
        friendlyName: factor.friendly_name?.trim() || `Authenticator ${index + 1}`,
      }));
      setFactors(verified);
      setFactorId(verified[0]?.id ?? "");
      setStatus(verified.length ? "Enter a current six-digit authenticator code." : "No verified TOTP factor is enrolled.");
    }
    void loadFactors();
    return () => { active = false; };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !factorId || !/^\d{6}$/.test(code) || pending) return;
    setPending(true);
    setStatus("Verifying fresh TOTP step-up…");
    try {
      const verification = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (verification.error) {
        setStatus("TOTP verification failed.");
        return;
      }
      const issuance = await fetch("/api/operator/session", {
        method: "POST",
        headers: {
          "x-cry-operator-request": "1",
          "x-cry-operator-csrf": csrfToken,
        },
        credentials: "same-origin",
        cache: "no-store",
      });
      setStatus(issuance.ok
        ? "Fresh step-up verified. The local read-only operator session is active for up to 15 minutes."
        : "Operator session issuance was denied.");
    } catch {
      setStatus("Operator session issuance is unavailable.");
    } finally {
      setCode("");
      setPending(false);
    }
  }

  return (
    <form className={styles.stepUpForm} onSubmit={submit}>
      {factors.length > 1 ? (
        <label>
          Authenticator
          <select value={factorId} onChange={(event) => setFactorId(event.target.value)} disabled={pending}>
            {factors.map((factor) => <option key={factor.id} value={factor.id}>{factor.friendlyName}</option>)}
          </select>
        </label>
      ) : null}
      <label>
        Authenticator code
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={pending || factors.length === 0}
          aria-describedby="operator-step-up-status"
        />
      </label>
      <button className="button secondary" type="submit" disabled={pending || !factorId || !/^\d{6}$/.test(code)}>
        {pending ? "Verifying…" : "Verify and start session"}
      </button>
      <p id="operator-step-up-status" role="status" aria-live="polite">{status}</p>
    </form>
  );
}
