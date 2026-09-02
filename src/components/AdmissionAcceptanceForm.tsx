"use client";

import { useRef, useState } from "react";

export default function AdmissionAcceptanceForm() {
  const idempotencyKey = useRef(crypto.randomUUID());
  const [state, setState] = useState<"idle" | "working" | "error">("idle");

  async function acceptAdmission() {
    setState("working");
    try {
      const response = await fetch("/api/admission/accept", {
        method: "POST",
        headers: { "idempotency-key": idempotencyKey.current },
      });
      if (!response.ok) throw new Error("acceptance failed");
      window.location.assign("/account");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="button-primary w-fit"
        disabled={state === "working"}
        onClick={acceptAdmission}
      >
        {state === "working" ? "Confirming access…" : "Confirm account access"}
      </button>
      {state === "error" ? (
        <p role="alert" className="text-sm text-red-300">
          Account access could not be confirmed. The invitation may be expired, revoked, or no longer eligible.
        </p>
      ) : null}
    </div>
  );
}
