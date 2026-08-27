import Link from "next/link";

type CommunityAvailabilityPanelProps = {
  className?: string;
  showSignInAction?: boolean;
};

export default function CommunityAvailabilityPanel({ className = "", showSignInAction = true }: CommunityAvailabilityPanelProps) {
  return (
    <aside className={["account-telemetry", "community-availability", className].filter(Boolean).join(" ")} aria-label="Current community status">
      <span className="account-telemetry__label">Current community status</span>
      <strong>Community is opening in stages</strong>
      <dl>
        <div><dt>Public Community</dt><dd data-status="open">Open</dd></div>
        <div><dt>Creators</dt><dd data-status="open">Public profile available</dd></div>
        <div><dt>Groups</dt><dd>No published groups yet</dd></div>
        <div><dt>Events</dt><dd>No approved calendar yet</dd></div>
        <div><dt>Activity</dt><dd>Not connected</dd></div>
      </dl>
      <p className="community-availability__note">Browse public profiles and participation plans without an account. Group membership and event registration are not available yet.</p>
      {showSignInAction ? <Link href="/account/sign-in" className="button home-secondary-cta">Sign in to My Home</Link> : null}
    </aside>
  );
}
