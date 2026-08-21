import type { Metadata } from "next";
import Link from "next/link";
import AccountSectionHero from "@/components/AccountSectionHero";
import { getInitialAccountIdentity } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Settings & Privacy",
  alternates: { canonical: "/account/settings" },
  description: "Review supported Cryptic Design preferences, privacy, security, and account lifecycle controls.",
};

export default async function SettingsPage() {
  const identity = await getInitialAccountIdentity();
  if (!identity.authenticated) return (
    <main className="account-page account-operational-page"><section className="account-state-message"><span className="eyebrow">Settings &amp; Privacy</span><h1>Sign in to manage settings</h1><p>Account and privacy settings are private.</p><Link href="/account/sign-in" className="button">Sign in</Link></section></main>
  );

  return (
    <main className="account-section-page">
      <AccountSectionHero
        eyebrow="Account / settings / privacy"
        title="Settings & Privacy"
        description="Manage supported display and privacy behavior while seeing honest availability states for controls still in development."
        image="/images/human-machine.png"
        imageAlt="An abstract digital iris representing personal controls"
      />
      <div className="shell page-stack account-section-page__body">
      <section className="account-control-section" aria-labelledby="general-settings-title">
        <header className="account-section-heading"><div><span className="eyebrow">General</span><h2 id="general-settings-title">Display &amp; accessibility</h2></div></header>
        <dl className="account-setting-list">
          <div><dt>Display preferences</dt><dd>Uses your browser and operating-system settings</dd></div>
          <div><dt>Reduced motion</dt><dd>Respects your operating-system preference</dd></div>
          <div><dt>Language</dt><dd>English · additional languages are not supported</dd></div>
        </dl>
      </section>
      <section id="privacy" className="account-control-section" aria-labelledby="privacy-settings-title">
        <header className="account-section-heading"><div><span className="eyebrow">Privacy</span><h2 id="privacy-settings-title">Character &amp; activity</h2></div><p>Characters remain private unless eligible owners separately authorize publication.</p></header>
        <dl className="account-setting-list">
          <div><dt>Character profile visibility</dt><dd>Managed with your Character</dd></div>
          <div><dt>Discoverability</dt><dd>Off by default · managed with your Character</dd></div>
          <div><dt>Activity visibility</dt><dd>Not published</dd></div>
          <div><dt>Mission history visibility</dt><dd>Not implemented</dd></div>
        </dl>
        <Link href="/account/character#identity-settings" className="button secondary">Manage character privacy</Link>
      </section>
      <section className="account-control-section" aria-labelledby="account-settings-title">
        <header className="account-section-heading"><div><span className="eyebrow">Account</span><h2 id="account-settings-title">Account lifecycle</h2></div><p>Security and recovery controls have their own Account section.</p></header>
        <div className="account-lifecycle-grid">
          <Link href="/account/security"><strong>Security &amp; recovery</strong><span>Review verification, sessions, password recovery, and sign-out.</span></Link>
          <article><strong>Export account data</strong><span>Not available yet.</span></article>
          <article><strong>Delete account</strong><span>Not available until governed deletion and retention handling is implemented.</span></article>
        </div>
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
      </div>
    </main>
  );
}
