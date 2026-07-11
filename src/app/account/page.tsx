import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Account",
  alternates: { canonical: "/account" },
  description: "Your Cryptic Design account, character, and settings.",
};

const ITEMS = [
  { href: "/account/create", title: "Create Account", body: "Join the platform — every account creates a character." },
  { href: "/account/sign-in", title: "Sign In", body: "Return to your library, character, and history." },
  { href: "/account/character", title: "Character Profile", body: "Identity, stats, level and XP, presence, history." },
  { href: "/account/subscription", title: "Subscription", body: "Free, Supporter, and Premium access." },
  { href: "/account/notifications", title: "Notifications", body: "Release alerts and platform messages." },
  { href: "/account/settings", title: "Settings", body: "Preferences and account controls." },
] as const;

export default function AccountHub() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Account</h1>
        <p className="max-w-2xl text-muted-foreground">
          Accounts are the platform&apos;s return layer — and every account
          creates a character. These surfaces are frontend previews until the
          account backend ships.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-gold">
            <h2 className="font-medium text-foreground">{i.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
