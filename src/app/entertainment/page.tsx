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
    <main className="shell page-stack">
      <header className="art-field art-orb grid min-h-[28rem] items-end border border-border p-6 sm:p-10 lg:grid-cols-[1fr_.8fr]">
        <div className="flex flex-col gap-4">
        <span className="text-xs uppercase tracking-widest text-accent-magenta">The content front door</span>
        <h1 className="display-title text-white">Enter the worlds, sound, and systems in motion.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Everything Cryptic Design creates for audiences—releases, franchises,
          games, cinema, audio, rooms, visual studies, and experiments.
        </p>
        <div />
        </div>
      </header>

      <LaneRow title="Featured Releases" href="/releases" releases={newestReleases(6)} />

      <section><div className="mb-5 flex items-end justify-between"><h2 className="section-title">Explore the platform</h2><span className="eyebrow text-accent-magenta">Six channels</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SURFACES.map((surface) => (
          <Link key={surface.href} href={surface.href} className="panel panel-interactive min-h-36 p-5 hover:border-accent-magenta">
            <h3 className="font-semibold text-foreground">{surface.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{surface.body}</p>
          </Link>
        ))}
      </div></section>

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
