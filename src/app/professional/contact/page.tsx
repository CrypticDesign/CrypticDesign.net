import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/professional/contact" },
  description: "Reach the Cryptic Design studio.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Contact</h1>
      <p className="max-w-xl text-muted-foreground">
        For project inquiries, use the structured inquiry path — it captures
        what we need to respond well. For everything else, email the studio
        directly.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link href="/professional/inquiry" className="rounded-control bg-accent-blue px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90">
          Start a project inquiry
        </Link>
        <a href="mailto:robertkcroft@outlook.com?subject=CrypticDesign.net%20contact" className="rounded-control border border-border px-5 py-2.5 text-sm text-foreground hover:border-neutral-500">
          Email the studio
        </a>
      </div>
      <Link href="/professional" className="text-sm text-accent-cyan hover:underline">← Professional Studio</Link>
    </main>
  );
}
