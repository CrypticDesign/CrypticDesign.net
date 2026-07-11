import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Audio",
  alternates: { canonical: "/audio" },
  description: "The Soundwave-powered audio backbone: catalog, artists, playlists, shared player.",
};

const SURFACES = [
  { title: "Shared Player", body: "One persistent player across the platform — plays releases, rooms, and playlists." },
  { title: "Audio Catalog", body: "Every published track, theme, and soundscape." },
  { title: "Artist Profiles", body: "Studio and collaborator credits behind each release." },
  { title: "Playlists", body: "Curated and personal listening threads." },
  { title: "Audio Submissions", body: "Approved-collaborator pipeline into governed audio releases." },
] as const;

export default function AudioPage() {
  const audio = publicReleases().filter((r) => r.kind === "audio");
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Audio</h1>
        <p className="max-w-2xl text-muted-foreground">
          Native platform audio, built on the Soundwave backbone. These
          surfaces are frontend previews — playback lands with the shared
          player.
        </p>
      </header>
      {audio.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">In the catalog</h2>
          <div className="flex flex-wrap gap-4">
            {audio.map((r) => <ReleaseCard key={r.slug} release={r} />)}
          </div>
        </section>
      )}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SURFACES.map((s) => (
          <div key={s.title} className="rounded-card border border-border bg-surface p-5">
            <h2 className="font-medium text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </section>
      <Link href="/entertainment/listening-rooms" className="text-sm text-accent-cyan hover:underline">
        Listening Rooms →
      </Link>
    </main>
  );
}
