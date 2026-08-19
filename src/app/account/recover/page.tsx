import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

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
          <p>Password recovery will be available when account services open.</p>
        </div>
      </header>
      <section className="account-content-grid">
        <section className="panel account-access-card flex flex-col items-start gap-4">
          <span className="eyebrow">Recovery status</span>
          <h2 className="text-2xl font-semibold">Password recovery is not active yet.</h2>
          <p className="text-sm text-muted-foreground">New accounts are closed, and recovery emails are not connected in this preview. When account services open, you will be able to request a secure reset link here.</p>
          <Link href="/account/sign-in" className="button secondary">Return to sign in</Link>
        </section>
        <aside className="account-context-panel">
          <span className="eyebrow">Keep your account secure</span>
          <h2>Recovery will verify that the account belongs to you.</h2>
          <p>Reset links will be time-limited and sent only to the email address attached to your account.</p>
        </aside>
      </section>
    </main>
  );
}
