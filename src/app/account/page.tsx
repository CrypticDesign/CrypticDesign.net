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
    <main className="shell page-stack">
      <header className="art-field art-figure grid min-h-72 items-end border border-accent-gold/30 p-6 sm:p-8 lg:grid-cols-[1fr_.7fr]">
        <div className="flex flex-col gap-3"><span className="eyebrow text-accent-gold">Member identity</span>
        <h1 className="display-title text-white">Account</h1>
        <p className="max-w-2xl text-muted-foreground">
          Your account connects your character, library, history, and settings.
          Every account begins with a character; account syncing is coming later.
        </p></div><div />
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((i) => (
          <Link key={i.href} href={i.href} className="panel panel-interactive min-h-36 p-5 hover:border-accent-gold">
            <h2 className="font-medium text-foreground">{i.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
