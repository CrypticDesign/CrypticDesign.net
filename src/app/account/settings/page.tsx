import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Settings",
  alternates: { canonical: "/account/settings" },
  description: "Account settings and preferences.",
};

export default function SettingsPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Settings</h1>
      <p className="max-w-xl text-muted-foreground">
        Preferences, privacy, and account controls arrive with the account
        backend.
      </p>
      <Link href="/account" className="text-sm text-accent-cyan hover:underline">← Account</Link>
    </main>
  );
}
