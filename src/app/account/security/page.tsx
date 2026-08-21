import type { Metadata } from "next";
import Link from "next/link";
import AccountSectionHero from "@/components/AccountSectionHero";
import AccountSignOutButton from "@/components/AccountSignOutButton";
import { getInitialAccountIdentity } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Account Security",
  alternates: { canonical: "/account/security" },
  description: "Review Cryptic Design account verification, session, password recovery, and security controls.",
};

function formatDate(value: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value));
}

export default async function SecurityPage() {
  const identity = await getInitialAccountIdentity();
  if (!identity.authenticated) return (
    <main className="account-page account-operational-page">
      <section className="account-state-message"><span className="eyebrow">Security</span><h1>Sign in to review security</h1><p>Verification, session, and recovery details are private.</p><Link href="/account/sign-in" className="button">Sign in</Link></section>
    </main>
  );

  return (
    <main className="account-section-page">
      <AccountSectionHero
        eyebrow="Account / security / recovery"
        title="Security & Recovery"
        description="Review verified account state, the current session, recovery options, and security alerts without exposing private credentials."
        image="/images/current-focus.png"
        imageAlt="A luminous blue geometric security field"
      />
      <div className="shell page-stack account-section-page__body">
      <section className="account-control-section" aria-labelledby="security-state-title">
        <header className="account-section-heading"><div><span className="eyebrow">Current state</span><h2 id="security-state-title">Account security</h2></div><p>Only the current authenticated session is confirmed. A complete device inventory is not available.</p></header>
        <dl className="account-identity-grid">
          <div><dt>Email verification</dt><dd>{identity.emailVerified === null ? "Not used by the local test account" : identity.emailVerified ? "Verified" : "Verification required"}</dd></div>
          <div><dt>Current session</dt><dd><span className="account-status-label" data-state="open">Active</span></dd></div>
          <div><dt>Last sign-in</dt><dd>{formatDate(identity.lastSignInAt)}</dd></div>
          <div><dt>Security alerts</dt><dd>{identity.emailVerified === false ? "Action needed: verify email" : "No current alert"}</dd></div>
          <div><dt>Other devices</dt><dd>Device inventory unavailable</dd></div>
          <div><dt>Account mode</dt><dd>{identity.mode === "sandbox" ? "Local test account" : "Production account"}</dd></div>
        </dl>
      </section>
      <section className="account-control-section" aria-labelledby="recovery-controls-title">
        <header className="account-section-heading"><div><span className="eyebrow">Sign-in &amp; recovery</span><h2 id="recovery-controls-title">Security controls</h2></div></header>
        <div className="account-lifecycle-grid">
          <Link href="/account/reset-password"><strong>Change password</strong><span>Available for an authenticated production account.</span></Link>
          <Link href="/account/recover"><strong>Password recovery</strong><span>Request a secure recovery email.</span></Link>
          <article><strong>Change email</strong><span>Not available yet.</span></article>
        </div>
      </section>
      <section className="account-control-section account-control-section--gated" aria-labelledby="session-title">
        <header className="account-section-heading"><div><span className="eyebrow">Session</span><h2 id="session-title">Sign out of this device</h2></div><p>Signing out ends only the current browser session.</p></header>
        <AccountSignOutButton />
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
      </div>
    </main>
  );
}
