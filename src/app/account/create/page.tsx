import type { Metadata } from "next";
import Link from "next/link";
import AccountAccessForm from "@/components/AccountAccessForm";

export const metadata: Metadata = {
  title: "Create Account",
  alternates: { canonical: "/account/create" },
  description: "Create a CrypticDesign.net account and persistent character.",
};

export default function CreateAccountPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Create Account</h1>
        <p className="max-w-xl text-muted-foreground">
          Create a free member account, confirm your email, then build the character
          that carries your identity across the Entertainment Hub.
        </p>
      </header>
      <AccountAccessForm mode="create" />
      <div className="flex flex-wrap gap-3 text-sm"><Link href="/account/sign-in" className="text-accent-cyan hover:underline">Already have an account? Sign in</Link><Link href="/account" className="text-accent-cyan hover:underline">Back to Account</Link></div>
    </main>
  );
}
