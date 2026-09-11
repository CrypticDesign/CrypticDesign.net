import { AnalyticsLink } from "@/components/AnalyticsLink";

import type { AccountAdmissionMode } from "@/lib/account-admission";
import { ANALYTICS_EVENTS } from "@/lib/analytics";

type AccountEcosystemStatusProps = {
  admissionMode: AccountAdmissionMode;
  showAvailabilityAction?: boolean;
  className?: string;
};

export default function AccountEcosystemStatus({
  admissionMode,
  showAvailabilityAction = true,
  className = "",
}: AccountEcosystemStatusProps) {
  const invitationOnly = admissionMode === "invitation";

  return (
    <aside
      className={["account-telemetry", "account-ecosystem-status", className].filter(Boolean).join(" ")}
      aria-label="Current ecosystem status"
    >
      <span className="account-telemetry__label">Current ecosystem status</span>
      <strong data-status="closed"><i aria-hidden="true" /> {invitationOnly ? "Invitation only" : "Accounts closed"}</strong>
      <dl>
        <div><dt>Public site</dt><dd data-status="open">Open</dd></div>
        <div><dt>New accounts</dt><dd data-status="closed">{invitationOnly ? "Invitation only" : "Not available"}</dd></div>
        <div><dt>Subscriptions</dt><dd data-status="closed">Not available</dd></div>
      </dl>
      <p className="account-ecosystem-status__note">
        {invitationOnly
          ? "New accounts are currently limited to invited users while we finish the account and subscription model for launch."
          : "New accounts are temporarily closed while we finish the account and subscription model for launch."}
      </p>
      {showAvailabilityAction ? (
        <AnalyticsLink href="/account/create" className="button home-secondary-cta account-ecosystem-status__cta" analyticsEvent={{ name: ANALYTICS_EVENTS.REQUEST_ACCESS_OPEN, payload: { source: "account_status" } }}>Account availability</AnalyticsLink>
      ) : null}
    </aside>
  );
}
