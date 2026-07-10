import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
  description: "Your Cryptic Design account and character.",
};

export default function AccountPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Account</h1>
      <p className="max-w-xl text-neutral-400">
        Accounts are coming in a later release. Every account will create a
        required character — your account holds ownership, access, and
        billing; your character carries identity, progression, presence, and
        history across the platform.
      </p>
    </main>
  );
}
