"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { MEMBERSHIP_SESSION_CHANGED_EVENT } from "@/lib/membership-session-events";

export type AccountFeatureAction = { href: string; label: string };

export default function AccountFeatureActions({
  initialAuthenticated,
  signedOutPrimary,
  signedOutSecondary,
  signedInPrimary,
  signedInSecondary,
}: {
  initialAuthenticated: boolean;
  signedOutPrimary: AccountFeatureAction;
  signedOutSecondary?: AccountFeatureAction;
  signedInPrimary?: AccountFeatureAction;
  signedInSecondary?: AccountFeatureAction;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);

  useEffect(() => {
    let active = true;

    async function syncSession() {
      try {
        const response = await fetch("/api/membership/session", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) setAuthenticated(Boolean(payload.authenticated));
      } catch {
        // Preserve the server-rendered state when account services are unavailable.
      }
    }

    function handleSessionChange(event: Event) {
      const detail = (event as CustomEvent<{ authenticated?: boolean }>).detail;
      if (typeof detail?.authenticated === "boolean") {
        setAuthenticated(detail.authenticated);
        return;
      }
      void syncSession();
    }

    void syncSession();
    window.addEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      active = false;
      window.removeEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, []);

  const primary = authenticated && signedInPrimary ? signedInPrimary : signedOutPrimary;
  const secondary = authenticated && signedInPrimary ? signedInSecondary : signedOutSecondary;

  return (
    <div className="hero-actions">
      <Link href={primary.href} className="button">{primary.label}</Link>
      {secondary ? <Link href={secondary.href} className="button secondary">{secondary.label}</Link> : null}
    </div>
  );
}
