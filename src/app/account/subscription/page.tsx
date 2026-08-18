import type { Metadata } from "next";
import Link from "next/link";

import MembershipSandbox from "@/components/MembershipSandbox";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";

export const metadata: Metadata = {
  title: "Subscription",
  alternates: { canonical: "/account/subscription" },
  description: "Preview CrypticDesign.net membership tiers in the local sandbox.",
};

export default function SubscriptionPage() {
  return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="magenta"
        eyebrow="Membership · Subscription preview"
        title="Support the work. Enter the worlds."
        description="Membership is being designed as the connective layer between Cryptic Design releases, your persistent identity, and deeper access to work in progress."
        image="/images/current-focus.png"
        imageAlt="A blue geometric signal forming in space"
        benefits={[
          { title: "Member updates", body: "Follow production notes, development signals, and the decisions shaping active Cryptic Design work." },
          { title: "Earlier access", body: "Enter eligible prototypes, previews, and limited releases before wider public availability." },
          { title: "Deeper experiences", body: "Unlock subscriber releases and persistent features while directly supporting independent production." },
        ]}
        steps={[
          { title: "Explore the model", body: "Review the current tier concepts and the access each is intended to provide." },
          { title: "Choose deliberately", body: "Select only the level that matches the work you want to follow and support." },
          { title: "Stay in control", body: "Subscription status, access, and renewal controls remain visible from your account." },
        ]}
        primaryAction={{ href: "/account/create", label: "Check availability" }}
        secondaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        note="Subscriptions and payments are not open. The tiers and prices below are local product previews, not a launch offer or billing commitment."
      />
      <section className="account-feature-preview" aria-labelledby="membership-preview-title">
        <header><span className="eyebrow">Local framework</span><h2 id="membership-preview-title">Explore the membership model</h2><p>No payment is collected and no real subscription is created.</p></header>
        <MembershipSandbox />
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
    </main>
  );
}
