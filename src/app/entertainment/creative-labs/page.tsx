import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Creative Labs",
  alternates: { canonical: "/entertainment/creative-labs" },
  description: "Visual Studies and experiments from Cryptic Design's Creative Labs.",
};

export default function CreativeLabsPage() {
  const labs = publicReleases().filter((r) => r.kind === "lab");
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Creative Labs</h1>
        <p className="max-w-xl text-muted-foreground">
          Visual Studies — research, process work, and selected releases from
          the lab (home of the former Image of the Day archive).
        </p>
      </header>
      {labs.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {labs.map((r) => <ReleaseCard key={r.slug} release={r} />)}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          First study is being prepared for release.
        </p>
      )}
      <Link href="/entertainment" className="text-sm text-accent-cyan hover:underline">← Entertainment Channel</Link>
    </main>
  );
}
