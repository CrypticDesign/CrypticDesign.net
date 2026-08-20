import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import { accountAdmissionMode } from "@/lib/account-admission";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
  description: "Your Cryptic Design account, character, and settings.",
};

const ITEMS = [
  { href: "/account/create", code: "01", accent: "cyan", title: "Account Availability", body: "See when new accounts will open and how invitations will work." },
  { href: "/account/sign-in", code: "02", accent: "blue", title: "Sign In", body: "Return to your character, library, and activity." },
  { href: "/account/character", code: "03", accent: "gold", title: "Character", body: "Create your identity and keep your progress together." },
  { href: "/account/subscription", code: "04", accent: "magenta", title: "Subscription", body: "See what a subscription will include when plans open." },
  { href: "/account/notifications", code: "05", accent: "green", title: "Notifications", body: "Choose the releases and account updates you want to receive." },
  { href: "/account/settings", code: "06", accent: "cyan", title: "Settings", body: "Manage your privacy, preferences, and account." },
] as const;

const BENEFITS = [
  { code: "01", title: "Save what matters", body: "Keep releases, articles, music, and worlds together in My Library." },
  { code: "02", title: "Create your character", body: "Build one identity to use across supported Cryptic Design experiences." },
  { code: "03", title: "Keep your progress", body: "Return to your activity, achievements, and discoveries when you come back." },
] as const;

export default async function AccountHub() {
  const authenticated = await getInitialAccountAuthenticated();
  const admissionMode = accountAdmissionMode();

  if (!authenticated) {
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

  return (
    <main className="account-page account-hub">
      <header className="account-hero account-hero--full-bleed account-hero--hub">
        <div className="account-hero__image" aria-hidden="true">
          <Image src="/images/my-home-hero.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">Your Cryptic Design account</span>
          <h1 className="display-title">Account</h1>
          <p>
            Keep your character, saved releases, activity, and settings together.
            New accounts are not open yet, but you can explore what is planned.
          </p>
        </div>
        <aside className="account-telemetry" aria-label="Account status">
          <span className="account-telemetry__label">Account status</span>
          <strong data-status="preview"><i aria-hidden="true" /> Preview</strong>
          <dl>
            <div><dt>Characters</dt><dd data-status="preview">In testing</dd></div>
            <div><dt>New accounts</dt><dd data-status="closed">Closed</dd></div>
            <div><dt>Subscriptions</dt><dd data-status="closed">Not available</dd></div>
          </dl>
        </aside>
      </header>
      <section className="account-command-grid" aria-label="Account destinations">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="account-command-card" data-accent={i.accent}>
            <span className="account-command-card__code">CRY / {i.code}</span>
            <h2>{i.title}</h2>
            <p>{i.body}</p>
            <span className="account-command-card__action">View details <b aria-hidden="true">→</b></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
