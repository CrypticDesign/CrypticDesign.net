import type { Metadata } from "next";
import Link from "next/link";
import { publicWorks } from "@/lib/works";

export const metadata: Metadata = {
  title: "Creative Works",
  description: "Original Cryptic Design works and their release context.",
  alternates: { canonical: "/creative-works" },
};

export default function CreativeWorksPage() {
  const works = publicWorks();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Creative Works</h1>
        <p className="max-w-2xl text-neutral-400">
          Original works are the long-lived context for published releases,
          worlds, labs, and platform activity.
        </p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {works.map((work) => (
          <Link
            key={work.slug}
            href={`/creative-works/${work.slug}`}
            className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-cyan"
          >
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              {work.kind}
            </span>
            <h2 className="mt-2 text-lg font-medium text-foreground">
              {work.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{work.summary}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
