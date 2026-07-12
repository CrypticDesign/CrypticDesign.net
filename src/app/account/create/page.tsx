import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  alternates: { canonical: "/account/create" },
  description: "Join CrypticDesign.net — every account creates a character.",
};

export default function CreateAccountPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Create Account</h1>
        <p className="max-w-xl text-muted-foreground">
          Account creation opens with the platform backend. Onboarding will
          flow directly into required character creation — your character is
          your identity across the Arcade, Cinema, Listening Rooms, and rooms.
        </p>
      </header>
      <div className="flex flex-wrap gap-3">
        <Link href="/account/create-character" className="rounded-control bg-accent-gold px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
          Preview character creation (required step)
        </Link>
        <Link href="/account" className="rounded-control border border-border px-5 py-2.5 text-sm text-foreground hover:border-neutral-500">
          Back to Account
        </Link>
      </div>
    </main>
  );
}
