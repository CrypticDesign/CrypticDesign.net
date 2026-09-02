import type { Metadata } from "next";
import Link from "next/link";

import AdmissionAcceptanceForm from "@/components/AdmissionAcceptanceForm";

export const metadata: Metadata = {
  title: "Accept Account Invitation",
  robots: { index: false, follow: false },
};

export default function AcceptInvitationPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">Account invitation</p>
        <h1 className="text-3xl font-semibold text-white">Confirm your account access.</h1>
        <p className="max-w-xl text-muted-foreground">
          Continue only if this invitation was sent to you. Cryptic Design will recheck the invitation,
          payment eligibility, and launch wave before creating membership access.
        </p>
      </header>
      <section className="max-w-xl border border-[var(--line)] bg-[var(--surface)] p-6">
        <AdmissionAcceptanceForm />
      </section>
      <Link href="/account/sign-in" className="text-sm text-accent-cyan hover:underline">Return to sign in</Link>
    </main>
  );
}
