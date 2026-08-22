import Link from "next/link";

type CommunityAvailabilityPanelProps = {
  className?: string;
  showSignInAction?: boolean;
};

export default function CommunityAvailabilityPanel({ className = "", showSignInAction = true }: CommunityAvailabilityPanelProps) {
  return (
    <aside className={["account-telemetry", "community-availability", className].filter(Boolean).join(" ")} aria-label="Current community status">
      <span className="account-telemetry__label">Current community status</span>
      <strong data-status="closed"><i aria-hidden="true" /> Community features not available yet</strong>
      <dl>
        <div><dt>Public discovery</dt><dd data-status="open">Open</dd></div>
        <div><dt>Crews &amp; groups</dt><dd data-status="closed">Not available</dd></div>
        <div><dt>Events &amp; discussions</dt><dd data-status="closed">Not available</dd></div>
      </dl>
      <p className="community-availability__note">This page presents the planned community layer without creating accounts, conversations, member directories, events, or participation data.</p>
      {showSignInAction ? <Link href="/account/sign-in" className="button home-secondary-cta">Sign in to My Home</Link> : null}
    </aside>
  );
}
