import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AccountAccessForm from "@/components/AccountAccessForm";
import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import { accountAdmissionMode } from "@/lib/account-admission";

export const metadata: Metadata = {
  title: "Account Availability",
  alternates: { canonical: "/account/create" }, openGraph: { images: ["/share/account-create.png"] }, twitter: { card: "summary_large_image", images: ["/share/account-create.png"] }, 
  description: "See when new Cryptic Design accounts will become available.",
};

export default function CreateAccountPage() {
  return (
    <main className="account-page">
      <header className="account-hero">
        <div className="account-hero__image account-hero__image--contain" aria-hidden="true">
          <Image src="/images/human-machine.png" alt="" fill sizes="(max-width: 900px) 100vw, 55vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">New accounts</span>
          <h1 className="display-title">Account<br />Availability</h1>
          <p>
            New accounts are not open yet. When invitations begin, you will need one
            to create an account. You can still explore the public site without signing in.
          </p>
        </div>
        <AccountEcosystemStatus admissionMode={accountAdmissionMode()} showAvailabilityAction={false} />
      </header>
      <section className="account-content-grid">
        <AccountAccessForm mode="create" />
        <aside className="account-context-panel">
          <span className="eyebrow">What remains open</span>
          <h2>Explore without an account.</h2>
          <p>You do not need an account to explore public releases, articles, and previews.</p>
          <ul>
            <li><span>01</span> Original worlds and releases</li>
            <li><span>02</span> Articles and visual studies</li>
            <li><span>03</span> Entertainment samples</li>
          </ul>
        </aside>
      </section>
      <nav className="account-link-rail" aria-label="Account navigation">
        <Link href="/account/sign-in">Already have access? Sign in <span aria-hidden="true">→</span></Link>
        <Link href="/account">Return to Account <span aria-hidden="true">→</span></Link>
      </nav>
    </main>
  );
}
