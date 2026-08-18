import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
          <span className="eyebrow">Cryptic Design · Secure access</span>
          <h1 className="display-title">Sign In</h1>
          <p>Access your CrypticDesign.net account and persistent character.</p>
        </div>
      </header>
      <section className="account-content-grid">
        <AccountAccessForm mode="sign-in" />
        <aside className="account-context-panel">
          <span className="eyebrow">Identity continuity</span>
          <h2>Return to your signal.</h2>
          <p>Your character, library, activity, and settings live behind verified member access.</p>
        </aside>
      </section>
      <nav className="account-link-rail" aria-label="Account navigation">
        <Link href="/account/subscription">Subscription preview <span aria-hidden="true">→</span></Link>
        <Link href="/library">My Library <span aria-hidden="true">→</span></Link>
        <Link href="/account">Return to Account <span aria-hidden="true">→</span></Link>
      </nav>
    </main>
  );
}
