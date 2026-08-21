"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { announceMembershipSession } from "@/lib/membership-session-events";

export default function AccountSignOutButton({ className = "button secondary" }: { className?: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signOut() {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/membership/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Sign out could not be completed.");
      announceMembershipSession(false);
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
      setSaving(false);
    }
  }

  return (
    <span className="account-sign-out-control">
      <button type="button" className={className} onClick={signOut} disabled={saving}>
        {saving ? "Signing out…" : "Sign out"}
      </button>
      {error ? <span role="alert">{error}</span> : null}
    </span>
  );
}
