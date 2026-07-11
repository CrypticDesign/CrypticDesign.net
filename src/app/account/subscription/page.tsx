import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription",
  alternates: { canonical: "/account/subscription" },
  description: "Free, Supporter, and Premium access to CrypticDesign.net.",
};

const TIERS = [
  { name: "Free", body: "Browse public releases, save to your library, join open rooms." },
  { name: "Supporter", body: "Early drops, supporter updates, and supporter presence." },
  { name: "Premium", body: "Full access — premium releases, rooms, and unlocks." },
] as const;

export default function SubscriptionPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Subscription</h1>
        <p className="max-w-xl text-muted-foreground">
          Access tiers are previews — no payments exist on the platform yet.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-3">
        {TIERS.map((t) => (
          <div key={t.name} className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-medium text-foreground">{t.name}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </section>
      <Link href="/account" className="text-sm text-accent-cyan hover:underline">← Account</Link>
    </main>
  );
}
