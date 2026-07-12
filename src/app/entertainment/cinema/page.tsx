import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Cinema",
  alternates: { canonical: "/entertainment/cinema" },
  description: "Video, episodes, and cinematics from Cryptic Design.",
};

export default function CinemaPage() {
  const videos = publicReleases().filter((r) => r.kind === "video");
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Cinema</h1>
        <p className="max-w-xl text-muted-foreground">
          Cinematics, shorts, and series — starting with the Singularis
          Overture.
        </p>
      </header>
      {videos.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {videos.map((r) => <ReleaseCard key={r.slug} release={r} />)}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          First screening is in the pipeline.
        </p>
      )}
      <Link href="/entertainment" className="text-sm text-accent-cyan hover:underline">← Entertainment Channel</Link>
    </main>
  );
}
