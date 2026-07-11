import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { newestReleases } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Entertainment",
  alternates: { canonical: "/entertainment" },
  description:
    "The Cryptic Design Entertainment Channel — featured drops, rooms, arcade, cinema, listening rooms, and Creative Labs.",
};

const SURFACES = [
  { href: "/entertainment/arcade", title: "Arcade", body: "Playable web releases and prototypes." },
  { href: "/entertainment/cinema", title: "Cinema", body: "Video, episodes, and cinematics." },
  { href: "/entertainment/listening-rooms", title: "Listening Rooms", body: "Scores, themes, and soundscapes." },
  { href: "/entertainment/virtual-rooms", title: "Virtual Rooms", body: "Lightweight shared spaces around releases." },
  { href: "/entertainment/creative-labs", title: "Creative Labs", body: "Visual Studies and experiments." },
  { href: "/library", title: "My Library", body: "Saved releases and history." },
] as const;

export default function ChannelHome() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">Entertainment Channel</h1>
        <p className="max-w-2xl text-muted-foreground">
          Featured drops and every way to experience Cryptic Design originals —
          play, watch, listen, and explore.
        </p>
      </header>

      <LaneRow title="Featured Drops" href="/releases" releases={newestReleases(6)} />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SURFACES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-card border border-border bg-surface p-5 transition-colors hover:border-accent-magenta"
          >
            <h2 className="font-medium text-foreground">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
