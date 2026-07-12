import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Listening Rooms",
  alternates: { canonical: "/entertainment/listening-rooms" },
  description: "Original scores, themes, and soundscapes.",
};

export default function ListeningRoomsPage() {
  const audio = publicReleases().filter((r) => r.kind === "audio");
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Listening Rooms</h1>
        <p className="max-w-xl text-muted-foreground">
          Audio releases played through the platform&apos;s shared player —
          powered by the Soundwave backbone as it comes online.
        </p>
      </header>
      {audio.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {audio.map((r) => <ReleaseCard key={r.slug} release={r} />)}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          First listening session is in the pipeline.
        </p>
      )}
      <div className="flex gap-4 text-sm">
        <Link href="/audio" className="text-accent-cyan hover:underline">Audio catalog →</Link>
        <Link href="/entertainment" className="text-accent-cyan hover:underline">← Entertainment Channel</Link>
      </div>
    </main>
  );
}
