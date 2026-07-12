import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { newestReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Entertainment Hub",
  alternates: { canonical: "/entertainment" },
  description: "The complete front door to Cryptic Design entertainment, releases, franchises, and content categories.",
};

const SURFACES = [
  { href: "/entertainment/arcade", title: "Arcade", body: "Playable web releases and prototypes." },
  { href: "/entertainment/cinema", title: "Cinema", body: "Video, episodes, and cinematics." },
  { href: "/entertainment/listening-rooms", title: "Listening Rooms", body: "Scores, themes, and soundscapes." },
  { href: "/entertainment/virtual-rooms", title: "Virtual Rooms", body: "Lightweight shared spaces around releases." },
  { href: "/entertainment/creative-labs", title: "Creative Labs", body: "Visual Studies and experiments." },
  { href: "/library", title: "My Library", body: "Saved releases and history." },
] as const;

export default function EntertainmentHub() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <span className="text-xs uppercase tracking-widest text-accent-magenta">The content front door</span>
        <h1 className="text-3xl font-semibold text-white">Entertainment Hub</h1>
        <p className="max-w-2xl text-muted-foreground">
          Everything Cryptic Design creates for audiences—releases, franchises,
          games, cinema, audio, rooms, visual studies, and experiments.
        </p>
      </header>

      <LaneRow title="Featured Releases" href="/releases" releases={newestReleases(6)} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SURFACES.map((surface) => (
          <Link key={surface.href} href={surface.href} className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-magenta">
            <h2 className="font-medium text-foreground">{surface.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{surface.body}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/products" className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-magenta">
          <h2 className="font-medium text-foreground">Products &amp; Franchises</h2>
          <p className="mt-2 text-sm text-muted-foreground">Singularis, Lifa, Soundwave, Cryptic Design Audio, and future worlds.</p>
        </Link>
        <Link href="/audio" className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-cyan">
          <h2 className="font-medium text-foreground">Audio</h2>
          <p className="mt-2 text-sm text-muted-foreground">The Soundwave-powered catalog, artists, playlists, and listening experiences.</p>
        </Link>
        <Link href="/releases" className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-blue">
          <h2 className="font-medium text-foreground">All Releases</h2>
          <p className="mt-2 text-sm text-muted-foreground">Browse the complete governed release catalog.</p>
        </Link>
      </section>
    </main>
  );
}
