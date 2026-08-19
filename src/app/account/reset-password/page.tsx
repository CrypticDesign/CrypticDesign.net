import type { Metadata } from "next";
import Image from "next/image";
import PasswordResetForm from "@/components/PasswordResetForm";

export const metadata: Metadata = {
  title: "Choose a New Password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <main className="account-page">
      <header className="account-hero account-hero--compact">
        <div className="account-hero__image" aria-hidden="true">
          <Image src="/images/current-focus.png" alt="" fill sizes="(max-width: 900px) 100vw, 70vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">Account security</span>
          <h1 className="display-title">Choose a new password</h1>
          <p>Use the secure recovery session from your email to update your account.</p>
        </div>
      </header>
      <section className="account-content-grid">
        <PasswordResetForm />
        <aside className="account-context-panel">
          <span className="eyebrow">A safer password</span>
          <h2>Make it long, unique, and easy for you to remember.</h2>
          <p>Use at least eight characters and do not reuse a password from another account.</p>
        </aside>
      </section>
    </main>
  );
}
