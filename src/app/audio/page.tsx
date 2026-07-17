import type { Metadata } from "next";
import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import { publicReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Audio",
  alternates: { canonical: "/audio" },
  description: "Cryptic Signal music, scores, soundscapes, and audio releases from Cryptic Design.",
};

const AUDIO_FEATURES = [
  { title: "Shared Player", body: "One persistent player across the platform — plays releases, rooms, and playlists." },
  { title: "Audio Catalog", body: "Every published track, theme, and soundscape." },
  { title: "Artist Profiles", body: "Studio and collaborator credits behind each release." },
  { title: "Playlists", body: "Curated and personal listening threads." },
  { title: "Audio Submissions", body: "A submission path for approved collaborators creating audio with Cryptic Design." },
] as const;

export default function AudioPage() {
  const audio = publicReleases().filter((r) => r.kind === "audio");
  return (
    <main className="shell page-stack">
      <header className="art-field art-orb grid min-h-72 items-end border border-accent-cyan/30 p-6 sm:p-8 lg:grid-cols-[1fr_.7fr]">
        <div className="flex flex-col gap-3"><span className="eyebrow text-accent-cyan">Cryptic Signal</span>
        <h1 className="display-title text-white">Audio</h1>
        <p className="max-w-2xl text-muted-foreground">
          Listen to music, scores, soundscapes, and audio releases from Cryptic
          Design. Shared playback is coming later.
        </p></div><div />
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
        {AUDIO_FEATURES.map((s) => (
          <div key={s.title} className="panel min-h-36 p-5">
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
