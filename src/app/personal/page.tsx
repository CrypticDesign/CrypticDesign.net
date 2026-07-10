import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { LANES, RELEASES, newestReleases, releasesForLane } from "@/lib/releases";

export const metadata: Metadata = {
  title: "Personal",
  alternates: { canonical: "/personal" },
  description:
    "The Cryptic Design entertainment hub — watch, listen, play, read, and explore Creative Labs.",
};

export default function PersonalHub() {
  const hero = RELEASES.find((r) => r.slug === "singularis-vertical-slice");

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
      {hero && (
        <section className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 to-neutral-900 p-6 sm:p-10">
          <span className="text-xs uppercase tracking-widest text-accent-magenta">
            Hero Feature
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {hero.title}
          </h1>
          <p className="max-w-xl text-neutral-400">{hero.tagline}</p>
          <div>
            <Link
              href={`/releases/${hero.slug}`}
              className="mt-2 inline-block rounded bg-accent-magenta px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              View release
            </Link>
          </div>
        </section>
      )}

      <LaneRow
        title="Continue"
        releases={[]}
        emptyNote="Your in-progress releases will appear here once accounts and characters arrive."
      />
      <LaneRow title="New Releases" releases={newestReleases(6)} />

      {LANES.map((lane) => (
        <LaneRow
          key={lane.slug}
          title={lane.name}
          href={`/personal/${lane.slug}`}
          releases={releasesForLane(lane.slug)}
          emptyNote={lane.blurb}
        />
      ))}

      <p className="text-sm text-neutral-500">
        Saved something?{" "}
        <Link href="/personal/library" className="text-accent-cyan hover:underline">
          Open your Library
        </Link>
        .
      </p>
    </main>
  );
}
