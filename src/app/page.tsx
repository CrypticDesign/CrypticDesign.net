import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { newestReleases } from "@/lib/releases";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "Cryptic Design is a platform for professional services, original work, and creative technology.",
};

const INTENT_ROUTES = [
  { label: "Hire", href: "/professional", body: "Professional services" },
  { label: "Collaborate", href: "/creator-tools", body: "Creator pathways" },
  { label: "Create", href: "/creator-tools", body: "Tools and requests" },
  { label: "Explore", href: "/creative-works", body: "Original works" },
  { label: "Sign In", href: "/account", body: "Library and account" },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-4 py-12 sm:px-6">
      <section className="flex flex-col gap-4 py-8 sm:py-16">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Original worlds. Holistic design.
        </h1>
        <p className="max-w-xl text-neutral-400">
          CrypticDesign.net brings Cryptic Design&apos;s professional services,
          creator pathways, and original work into one governed platform.
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {INTENT_ROUTES.map((intent) => (
            <Link
              key={intent.label}
              href={intent.href}
              className="rounded-card border border-border bg-surface p-4 transition-colors hover:border-accent-cyan"
            >
              <span className="block text-sm font-medium text-foreground">
                {intent.label}
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">
                {intent.body}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <LaneRow
        title="New Releases"
        href="/releases"
        releases={newestReleases(6)}
      />
    </main>
  );
}
