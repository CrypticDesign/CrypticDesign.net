import type { Metadata } from "next";
import Link from "next/link";
import LaneRow from "@/components/LaneRow";
import { newestReleases, publicReleases, releasesForLane } from "@/lib/releases";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  description:
    "CrypticDesign.net — original releases, the Entertainment Channel, and the Cryptic Design studio.",
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
            Featured
          </span>
          <h1 className="text-3xl font-semibold text-white sm:text-4xl">
            {hero.title}
          </h1>
          <p className="max-w-xl text-muted-foreground">{hero.tagline}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/releases/${hero.slug}`}
              className="mt-2 inline-block rounded-control bg-accent-magenta px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
            >
              View release
            </Link>
            <Link
              href="/entertainment"
              className="mt-2 inline-block rounded-control border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent-cyan"
            >
              Enter the Entertainment Channel
            </Link>
          </div>
        </section>
      )}

      <LaneRow title="Latest Releases" href="/releases" releases={newestReleases(6)} />
      <LaneRow title="Play" href="/entertainment/arcade" releases={releasesForLane("play")} />
      <LaneRow title="Watch" href="/entertainment/cinema" releases={releasesForLane("watch")} />
      <LaneRow title="Listen" href="/entertainment/listening-rooms" releases={releasesForLane("listen")} />
      <LaneRow title="Creative Labs" href="/entertainment/creative-labs" releases={releasesForLane("creative-labs")} />

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Products &amp; Franchises</h2>
          <p className="text-sm text-muted-foreground">
            Singularis, Lifa, Soundwave, and Cryptic Design Audio — each with a
            product home on the platform.
          </p>
          <Link href="/products" className="w-fit text-sm text-accent-blue hover:underline">
            Explore products →
          </Link>
        </div>
        <div className="flex flex-col gap-2 rounded-card border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">The studio behind the platform</h2>
          <p className="text-sm text-muted-foreground">
            Holistic UX, game UX, and creative technology — services, case
            studies, and research.
          </p>
          <Link href="/professional" className="w-fit text-sm text-accent-blue hover:underline">
            Professional Studio →
          </Link>
        </div>
      </section>
    </main>
  );
}
