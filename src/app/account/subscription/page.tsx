import type { Metadata } from "next";
import Link from "next/link";
import AccountSectionHero from "@/components/AccountSectionHero";
import { getInitialAccountIdentity } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Subscription & Access",
  alternates: { canonical: "/account/subscription" },
  description: "Review your Cryptic Design account, membership, subscription, and entitlement state.",
};

export default async function SubscriptionPage() {
  const identity = await getInitialAccountIdentity();
  if (!identity.authenticated) return (
    <main className="account-page account-operational-page">
      <section className="account-state-message"><span className="eyebrow">Subscription &amp; Access</span><h1>Sign in to review access</h1><p>Account, membership, subscription, and entitlement state is private.</p><Link href="/account/sign-in" className="button">Sign in</Link></section>
    </main>
  );

  return (
    <main className="account-section-page">
      <AccountSectionHero
        eyebrow="Account / subscription / access"
        title="Subscription & Access"
        description="Account, membership, subscription, and entitlement states remain separate so signing in never implies a purchase."
        image="/images/signal-systems.png"
        imageAlt="A connected blue signal system"
      />
      <div className="shell page-stack account-section-page__body">
      <section className="account-control-section" aria-labelledby="access-state-title">
        <header className="account-section-heading"><div><span className="eyebrow">Current state</span><h2 id="access-state-title">Your access</h2></div></header>
        <dl className="account-identity-grid">
          <div><dt>Site account</dt><dd><span className="account-status-label" data-state="open">Active</span></dd></div>
          <div><dt>Free membership</dt><dd>No separate membership record is available</dd></div>
          <div><dt>Paid subscription</dt><dd><span className="account-status-label" data-state="closed">Not available</span></dd></div>
          <div><dt>Email subscription</dt><dd>Not reported by account services</dd></div>
          <div><dt>Entitlements</dt><dd>Authenticated account features</dd></div>
          <div><dt>Payment state</dt><dd>No payment is collected</dd></div>
        </dl>
      </section>
      <section className="account-control-section account-control-section--gated" aria-labelledby="plans-title">
        <span className="eyebrow">Plans</span><h2 id="plans-title">Native paid subscriptions are not available.</h2><p>No tier, price, trial, payment method, invoice, or billing workflow is active on this site.</p>
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
      </div>
    </main>
  );
}
