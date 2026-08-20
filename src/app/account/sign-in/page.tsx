import type { Metadata } from "next";
import Image from "next/image";

import AccountAccessForm from "@/components/AccountAccessForm";

export const metadata: Metadata = {
  title: "Sign In",
  alternates: { canonical: "/account/sign-in" },
  description: "Sign in to CrypticDesign.net.",
};

export default function SignInPage() {
  return (
    <main className="account-page">
      <header className="account-hero account-hero--compact">
        <div className="account-hero__image" aria-hidden="true">
          <Image src="/images/current-focus.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">Welcome back</span>
          <h1 className="display-title">Sign In</h1>
          <p>Sign in to access your account, including your character, library, activity, settings, and subscription status.</p>
        </div>
      </header>
      <section className="account-content-grid">
        <AccountAccessForm mode="sign-in" />
        <aside className="account-context-panel">
          <span className="eyebrow">Account and subscription</span>
          <h2>Your account keeps everything connected.</h2>
          <p>Your account holds your character, library, activity, preferences, and subscription status in one place.</p>
          <p>A subscription is connected to your account. It unlocks subscriber access and helps support new work, but signing in does not start, renew, or change a subscription.</p>
        </aside>
      </section>
    </main>
  );
}
