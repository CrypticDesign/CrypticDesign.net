import type { EmailOtpType } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";

import { resolveEmailConfirmationPolicy } from "@/lib/email-confirmation-policy";

export const metadata: Metadata = {
  title: "Confirm Email",
  robots: { index: false, follow: false },
};

type ConfirmationSearchParams = {
  token_hash?: string | string[];
  type?: string | string[];
};

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<ConfirmationSearchParams>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const requestedType = typeof params.type === "string" ? params.type : "";
  const policy = resolveEmailConfirmationPolicy(requestedType);
  const type: EmailOtpType | null = policy?.type ?? null;
  const canConfirm = Boolean(tokenHash && policy?.allowed);
  const recoveringPassword = type === "recovery";
  const changingEmail = type === "email_change";
  const acceptingInvitation = policy?.kind === "admission";
  const admissionRequired = policy?.kind === "admission-required";

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">
          Account security
        </p>
        <h1 className="text-3xl font-semibold text-white">
          {recoveringPassword ? "Continue password recovery" : changingEmail ? "Confirm your new email" : acceptingInvitation ? "Continue your account invitation" : "Confirm your email"}
        </h1>
        <p className="max-w-xl text-muted-foreground">
          {canConfirm
            ? acceptingInvitation
              ? "Verify the invited email, then complete the remaining account-access checks."
              : recoveringPassword
              ? "Continue to a secure page where you can choose a new password."
              : "Confirm this email change for your existing Cryptic Design account."
            : admissionRequired
              ? "This link cannot admit a new member while account access is closed. Request access or sign in with an existing admitted account."
              : "This confirmation link is incomplete or invalid. Request a new account-security email and try again."}
        </p>
      </header>

      <section className="max-w-xl border border-[var(--line)] bg-[var(--surface)] p-6">
        {canConfirm ? (
          <form action="/auth/confirm/complete" method="post" className="flex flex-col gap-4">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type ?? ""} />
            <p className="text-sm text-muted-foreground">
              Automated email security checks can safely open this page. Confirmation only happens
              after this deliberate action.
            </p>
            <button type="submit" className="button-primary w-fit">
              {acceptingInvitation ? "Verify invited email" : recoveringPassword ? "Continue to reset password" : "Confirm email change"}
            </button>
          </form>
        ) : (
          <Link href="/account/create" className="button-primary inline-flex w-fit">
            Request access
          </Link>
        )}
      </section>

      <Link href="/account/sign-in" className="text-sm text-accent-cyan hover:underline">
        Return to sign in
      </Link>
    </main>
  );
}
