import type { Metadata } from "next";
import Link from "next/link";

import AccountAccessForm from "@/components/AccountAccessForm";

export const metadata: Metadata = {
  title: "Sign In",
  alternates: { canonical: "/account/sign-in" },
  description: "Sign in to CrypticDesign.net.",
};

export default function SignInPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Sign In</h1>
      <p className="max-w-xl text-muted-foreground">
        Access your CrypticDesign.net account and persistent character.
      </p>
      <AccountAccessForm mode="sign-in" />
      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/account/subscription" className="text-accent-cyan hover:underline">View subscription previews</Link>
        <Link href="/library" className="text-accent-cyan hover:underline">My Library</Link>
        <Link href="/account" className="text-accent-cyan hover:underline">← Account</Link>
      </div>
    </main>
  );
}
