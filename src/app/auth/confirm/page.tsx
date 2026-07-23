import type { EmailOtpType } from "@supabase/supabase-js";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Confirm Email",
  robots: { index: false, follow: false },
};

type ConfirmationSearchParams = {
  token_hash?: string | string[];
  type?: string | string[];
};

const confirmationTypes = new Set<EmailOtpType>([
  "email",
  "email_change",
  "invite",
  "magiclink",
  "recovery",
  "signup",
]);

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<ConfirmationSearchParams>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const requestedType = typeof params.type === "string" ? params.type : "";
  const type = confirmationTypes.has(requestedType as EmailOtpType)
    ? (requestedType as EmailOtpType)
    : null;
  const canConfirm = Boolean(tokenHash && type);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">
          Account security
        </p>
        <h1 className="text-3xl font-semibold text-white">Confirm your email</h1>
        <p className="max-w-xl text-muted-foreground">
          {canConfirm
            ? "Finish creating your Cryptic Design account. Your email is not confirmed until you press the button below."
            : "This confirmation link is incomplete or invalid. Request a new confirmation email and try again."}
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
              Confirm email address
            </button>
          </form>
        ) : (
          <Link href="/account/create" className="button-primary inline-flex w-fit">
            Create account
          </Link>
        )}
      </section>

      <Link href="/account/sign-in" className="text-sm text-accent-cyan hover:underline">
        Return to sign in
      </Link>
    </main>
  );
}
