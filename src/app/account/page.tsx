import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import AccountOverview from "@/components/AccountOverview";
import { accountAdmissionMode } from "@/lib/account-admission";
import { getInitialAccountIdentity } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
  description: "Your Cryptic Design account, character, and settings.",
};

const BENEFITS = [
  { code: "01", title: "Save what matters", body: "Keep releases, articles, music, and worlds together in My Library." },
  { code: "02", title: "Create your character", body: "Build one identity to use across supported Cryptic Design experiences." },
  { code: "03", title: "Keep your progress", body: "Return to your activity, achievements, and discoveries when you come back." },
] as const;

export default async function AccountHub() {
  const identity = await getInitialAccountIdentity();
  const admissionMode = accountAdmissionMode();

  if (!identity.authenticated) {
    const invitationOnly = admissionMode === "invitation";
    return (
      <main className="account-page account-signup-overview">
        <header className="account-hero account-hero--full-bleed account-hero--signup">
          <div className="account-hero__image" aria-hidden="true">
            <Image src="/images/my-home-hero.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
          </div>
          <div className="account-hero__copy">
            <div className="signal-rail" />
            <span className="eyebrow">Your place at Cryptic Design</span>
            <h1 className="display-title">Make this place yours.</h1>
            <p>
              An account keeps your character, saved releases, activity, and settings
              together so you can pick up where you left off.
            </p>
            <div className="hero-actions">
              <Link href="/account/create" className="button account-availability-cta">Check account availability</Link>
              <Link href="/account/sign-in" className="button secondary">Already have an account? Sign in</Link>
            </div>
          </div>
          <AccountEcosystemStatus admissionMode={admissionMode} showAvailabilityAction={false} />
        </header>
        <section className="account-benefit-section" aria-labelledby="account-benefits-title">
          <header>
            <span className="eyebrow">Account benefits</span>
            <h2 id="account-benefits-title">What an account gives you</h2>
            <p>You can explore the public site without an account. Signing up adds a personal place to save, return, and participate.</p>
          </header>
          <div className="account-benefit-grid">
            {BENEFITS.map((benefit) => (
              <article key={benefit.code}>
                <span>{benefit.code}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="account-signup-status" data-status="closed" aria-labelledby="signup-status-title">
          <div>
            <span className="eyebrow">Current status</span>
            <h2 id="signup-status-title">{invitationOnly ? "Accounts are invitation-only." : "New accounts are currently closed."}</h2>
            <p>{invitationOnly ? "Only people with an approved invitation can create an account right now." : "We are finishing the account and subscription model before opening registration."} Public releases, articles, and previews remain open to everyone.</p>
          </div>
          <Link href="/account/create" className="button secondary">View account availability</Link>
        </section>
      </main>
    );
  }

  return <AccountOverview identity={identity} />;
}
