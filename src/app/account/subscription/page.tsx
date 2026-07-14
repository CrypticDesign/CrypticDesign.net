import type { Metadata } from "next";
import Link from "next/link";

import MembershipSandbox from "@/components/MembershipSandbox";

export const metadata: Metadata = {
  title: "Subscription",
  alternates: { canonical: "/account/subscription" },
  description: "Preview CrypticDesign.net membership tiers in the local sandbox.",
};

export default function SubscriptionPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Subscription</h1>
        <p className="max-w-xl text-muted-foreground">
          Explore local membership previews. These controls save sandbox data on this computer only; no payment is collected.
        </p>
      </header>
      <MembershipSandbox />
      <Link href="/account" className="text-sm text-accent-cyan hover:underline">← Account</Link>
    </main>
  );
}
