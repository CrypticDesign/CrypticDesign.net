import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
  description: "Your Cryptic Design account, character, and settings.",
};

const ITEMS = [
  { href: "/account/create", code: "01", accent: "cyan", title: "Account Availability", body: "Subscriber accounts are not open yet; future access requires an approved invitation." },
  { href: "/account/sign-in", code: "02", accent: "blue", title: "Sign In", body: "Return to your library, character, and history." },
  { href: "/account/character", code: "03", accent: "gold", title: "Character Profile", body: "Identity, stats, level and XP, presence, history." },
  { href: "/account/subscription", code: "04", accent: "magenta", title: "Subscription", body: "Preview information only; paid activation is not yet open." },
  { href: "/account/notifications", code: "05", accent: "green", title: "Notifications", body: "Release alerts and platform messages." },
  { href: "/account/settings", code: "06", accent: "cyan", title: "Settings", body: "Preferences and account controls." },
] as const;

export default function AccountHub() {
  return (
    <main className="account-page account-hub">
      <header className="account-hero account-hero--hub">
        <div className="account-hero__image" aria-hidden="true">
          <Image src="/images/my-home-hero.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">Cryptic Design · Member system</span>
          <h1 className="display-title">Account</h1>
          <p>
            Your account connects your character, library, history, and settings.
            Every account begins with a character; account syncing is coming later.
          </p>
        </div>
        <aside className="account-telemetry" aria-label="Platform account status">
          <span className="account-telemetry__label">System status</span>
          <strong><i aria-hidden="true" /> Preview</strong>
          <dl>
            <div><dt>Identity</dt><dd>Persistent</dd></div>
            <div><dt>Registration</dt><dd>Closed</dd></div>
            <div><dt>Commerce</dt><dd>Inactive</dd></div>
          </dl>
        </aside>
      </header>
      <section className="account-command-grid" aria-label="Account destinations">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="account-command-card" data-accent={i.accent}>
            <span className="account-command-card__code">CRY / {i.code}</span>
            <h2>{i.title}</h2>
            <p>{i.body}</p>
            <span className="account-command-card__action">Open module <b aria-hidden="true">→</b></span>
          </Link>
        ))}
      </section>
    </main>
  );
}
