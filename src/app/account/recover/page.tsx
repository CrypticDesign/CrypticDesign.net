import type { Metadata } from "next";
import Image from "next/image";
import PasswordRecoveryForm from "@/components/PasswordRecoveryForm";

export const metadata: Metadata = {
  title: "Password Recovery",
  alternates: { canonical: "/account/recover" },
  robots: { index: false, follow: false },
};

export default function PasswordRecoveryPage() {
  return (
    <main className="account-page">
      <header className="account-hero account-hero--compact">
        <div className="account-hero__image" aria-hidden="true">
          <Image src="/images/current-focus.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">Account security</span>
          <h1 className="display-title">Reset your password</h1>
          <p>Enter the email connected to your account. We will send you a secure link to choose a new password.</p>
        </div>
      </header>
      <section className="account-content-grid">
        <PasswordRecoveryForm />
        <aside className="account-context-panel">
          <span className="eyebrow">Keep your account secure</span>
          <h2>Only the account owner can finish a reset.</h2>
          <p>The link is time-limited and goes only to the email address already attached to the account. We never reveal whether an email is registered.</p>
        </aside>
      </section>
    </main>
  );
}
