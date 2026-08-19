import type { Metadata } from "next";
import Link from "next/link";

import MembershipSandbox from "@/components/MembershipSandbox";
import AccountFeatureIntro from "@/components/AccountFeatureIntro";
import { getInitialAccountAuthenticated } from "@/lib/server-account-state";

export const metadata: Metadata = {
  title: "Subscription",
  alternates: { canonical: "/account/subscription" },
  description: "Preview CrypticDesign.net membership tiers in the local sandbox.",
};

export default async function SubscriptionPage() {
  const initialAuthenticated = await getInitialAccountAuthenticated();

  return (
    <main className="account-page account-feature-page">
      <AccountFeatureIntro
        accent="magenta"
        eyebrow="Membership"
        title="Get more from Cryptic Design."
        description="Subscribe to follow the work more closely, try selected releases early, and help us keep making independent projects."
        image="/images/current-focus.png"
        imageAlt="A blue geometric signal forming in space"
        benefits={[
          { title: "Follow the work", body: "Get behind-the-scenes updates on the projects and releases you care about." },
          { title: "Try things early", body: "Explore selected prototypes, previews, and limited releases before they open to everyone." },
          { title: "Help fund new work", body: "Your subscription directly supports independent games, stories, music, and experiments." },
        ]}
        steps={[
          { title: "Compare plans", body: "See what each plan includes before you choose one." },
          { title: "Choose what fits", body: "Pick the level that matches what you want to follow and support." },
          { title: "Manage it from your account", body: "See your access, renewal details, and subscription status in one place." },
        ]}
        primaryAction={{ href: "/account/create", label: "Check availability" }}
        secondaryAction={{ href: "/account/sign-in", label: "Sign in" }}
        signedInPrimaryAction={{ href: "#membership-preview-title", label: "View plan preview" }}
        signedInSecondaryAction={{ href: "/account", label: "Account overview" }}
        initialAuthenticated={initialAuthenticated}
        note="Subscriptions and payments are not open yet. The plans and prices below are previews only, and no payment will be taken."
      />
      <section className="account-feature-preview" aria-labelledby="membership-preview-title">
        <header><span className="eyebrow">Plan preview</span><h2 id="membership-preview-title">Compare subscription plans</h2><p>This is a preview. No payment is collected and no subscription is created.</p></header>
        <MembershipSandbox />
      </section>
      <Link href="/account" className="account-return-link">← Account overview</Link>
    </main>
  );
}
