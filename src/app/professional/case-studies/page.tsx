import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Studies",
  alternates: { canonical: "/professional/case-studies" },
  description: "Selected Cryptic Design work — problem, approach, craft, outcome.",
};

export default function CaseStudiesPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-white">Case Studies</h1>
      <p className="max-w-xl text-muted-foreground">
        Selected work told as problem → approach → craft → outcome. Client
        material appears here only after explicit case-safe review.
      </p>
      <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
        First case studies are in rights review.
      </p>
      <Link href="/professional" className="text-sm text-accent-cyan hover:underline">← Professional Studio</Link>
    </main>
  );
}
