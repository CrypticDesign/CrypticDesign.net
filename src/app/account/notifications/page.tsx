import type { Metadata } from "next";
import Link from "next/link";
import { getInitialAccountIdentity } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Notifications",
  alternates: { canonical: "/account/notifications" },
  description: "Review Cryptic Design account notification state and supported preferences.",
};

export default async function NotificationsPage() {
  const identity = await getInitialAccountIdentity();
  if (!identity.authenticated) return (
    <main className="account-page account-operational-page"><section className="account-state-message"><span className="eyebrow">Notifications</span><h1>Sign in to view notifications</h1><p>Account and security notices are private.</p><Link href="/account/sign-in" className="button">Sign in</Link></section></main>
  );

  return (
    <main className="account-page account-operational-page">
      <header className="account-operational-header"><span className="eyebrow">Account utility</span><h1 className="display-title">Notifications</h1><p>Notifications report events. They do not create, accept, or replace governed invitations.</p></header>
      <section className="account-control-section" aria-labelledby="notification-list-title">
        <header className="account-section-heading"><div><span className="eyebrow">Inbox</span><h2 id="notification-list-title">No notifications</h2></div><span className="account-status-label" data-state="open">All clear</span></header>
        <div className="account-empty-state"><strong>You are caught up.</strong><p>Account, security, Character, library, access, and approved platform updates will appear here when notification delivery is implemented.</p></div>
      </section>
      <section className="account-control-section" aria-labelledby="notification-preferences-title">
        <header className="account-section-heading"><div><span className="eyebrow">Preferences</span><h2 id="notification-preferences-title">Notification controls</h2></div><p>Controls remain unavailable until they can save reliably.</p></header>
        <dl className="account-setting-list">
          <div><dt>Account &amp; Security</dt><dd>Required notices · cannot be disabled</dd></div>
          <div><dt>Platform / Release Updates</dt><dd>Preference not available yet</dd></div>
          <div><dt>Character / Activity</dt><dd>Preference not available yet</dd></div>
          <div><dt>Mission Control</dt><dd>Feature not implemented</dd></div>
          <div><dt>Email notifications</dt><dd>Preference not available yet</dd></div>
        </dl>
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
    </main>
  );
}
