import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import {
  LANES,
  newestReleases,
  publicReleases,
  releasesForLane,
} from "@/lib/releases";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "Cryptic Design — an entertainment hub of original worlds, games, music, film, and experiments. Watch, listen, play, and read.",
};

export default function Home() {
  const hero = publicReleases().find(
    (release) => release.slug === "singularis-vertical-slice",
  );

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      {hero && (
        <section className="flex flex-col gap-3 rounded-card border border-border bg-gradient-to-br from-neutral-950 to-neutral-900 p-6 sm:p-10">
          <span className="text-xs uppercase tracking-widest text-accent-magenta">
            Hero Feature
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {hero.title}
          </h1>
          <p className="max-w-xl text-muted-foreground">{hero.tagline}</p>
          <div>
            <Link
              href={`/releases/${hero.slug}`}
              className="mt-2 inline-block rounded-control bg-accent-magenta px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              View release
            </Link>
          </div>
        </section>
      )}

      <LaneRow
        title="Continue"
        releases={[]}
        emptyNote="Your in-progress releases will appear here once accounts arrive."
      />
      <LaneRow title="New Releases" href="/releases" releases={newestReleases(6)} />

      {LANES.map((lane) => (
        <LaneRow
          key={lane.slug}
          title={lane.name}
          href={
            lane.slug === "creative-labs"
              ? "/labs"
              : lane.slug === "rooms"
                ? "/worlds"
                : lane.slug === "collections"
                  ? "/creative-works"
                  : "/releases"
          }
          releases={releasesForLane(lane.slug)}
          emptyNote={lane.blurb}
        />
      ))}

      <section className="flex flex-col gap-2 rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">
          The studio behind the worlds
        </h2>
        <p className="max-w-xl text-sm text-muted-foreground">
          Cryptic Design also builds for clients — holistic UX, game UX, and
          creative technology.
        </p>
        <Link
          href="/professional"
          className="w-fit text-sm text-accent-blue hover:underline"
        >
          Studio &amp; Services →
        </Link>
      </section>
    </main>
  );
}
