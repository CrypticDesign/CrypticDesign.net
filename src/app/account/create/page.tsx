import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import RequestAccessForm from "@/components/RequestAccessForm";
import AccountEcosystemStatus from "@/components/AccountEcosystemStatus";
import { accountAdmissionMode } from "@/lib/account-admission";

export const metadata: Metadata = {
  title: "Request Access",
  alternates: { canonical: "/account/create" }, openGraph: { images: ["/share/account-create.png"] }, twitter: { card: "summary_large_image", images: ["/share/account-create.png"] }, 
  description: "Request future CrypticDesign.net member access while public entertainment remains open without an account.",
};

export default function CreateAccountPage() {
  return (
    <main className="account-page">
      <header className="account-hero account-hero--full-bleed">
        <div className="account-hero__image account-hero__image--contain" aria-hidden="true">
          <Image src="/images/human-machine.png" alt="" fill sizes="(max-width: 900px) 100vw, 55vw" priority />
        </div>
        <div className="account-hero__copy">
          <div className="signal-rail" />
          <span className="eyebrow">REQUEST ACCESS</span>
          <h1 className="display-title">Join the next wave.</h1>
          <p>
            Public exploration is open now. Member access is being introduced in controlled waves
            while we finish the account, community, and subscription systems.
          </p>
        </div>
        <AccountEcosystemStatus admissionMode={accountAdmissionMode()} showAvailabilityAction={false} />
      </header>
      <section className="account-content-grid">
        <RequestAccessForm />
        <aside className="account-context-panel">
          <span className="eyebrow">What remains open</span>
          <h2>Explore without an account.</h2>
          <p>You do not need an account to explore public releases, articles, and previews.</p>
          <ul>
            <li><span>01</span> Original worlds and releases</li>
            <li><span>02</span> Articles and visual studies</li>
            <li><span>03</span> Entertainment samples</li>
          </ul>
          <Link href="/entertainment" className="button secondary">Explore Entertainment</Link>
        </aside>
      </section>
      <nav className="account-link-rail" aria-label="Account navigation">
        <Link href="/account/sign-in">Already have access? Sign In <span aria-hidden="true">→</span></Link>
        <Link href="/account">Return to Account <span aria-hidden="true">→</span></Link>
      </nav>
    </main>
  );
}
