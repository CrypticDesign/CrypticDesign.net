import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Create Account",
  alternates: { canonical: "/account/create" },
  description: "Preview CrypticDesign.net account onboarding and character creation.",
};

export default function CreateAccountPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Create Account</h1>
        <p className="max-w-xl text-muted-foreground">
          Preview account onboarding locally, then create the character that
          carries your identity across the Entertainment Hub. This sandbox
          creates no production account and sends no personal data.
        </p>
      </header>
      <div className="panel max-w-xl p-5 text-sm text-muted-foreground">
        The next step starts a temporary local preview session before showing
        character creation. Membership, permissions, and purchased access
        remain separate from character identity.
      </div>
      <div className="flex flex-wrap gap-3">
        <Link href="/account/create-character" className="button">
          Start local account preview
        </Link>
        <Link href="/account" className="button secondary">
          Back to Account
        </Link>
      </div>
    </main>
  );
}
