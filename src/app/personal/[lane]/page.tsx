import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReleaseCard from "@/components/ReleaseCard";
import { LANES, getLane, releasesForLane, type LaneSlug } from "@/lib/releases";

export function generateStaticParams() {
  return LANES.map((lane) => ({ lane: lane.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lane: string }>;
}): Promise<Metadata> {
  const { lane: laneSlug } = await params;
  const lane = getLane(laneSlug);
  if (!lane) return {};
  return {
    title: lane.name,
    description: lane.blurb,
    alternates: { canonical: `/personal/${lane.slug}` },
  };
}

export default async function LanePage({
  params,
}: {
  params: Promise<{ lane: string }>;
}) {
  const { lane: laneSlug } = await params;
  const lane = getLane(laneSlug);
  if (!lane) notFound();

  const releases = releasesForLane(lane.slug as LaneSlug);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">{lane.name}</h1>
        <p className="max-w-xl text-neutral-400">{lane.blurb}</p>
      </header>
      {releases.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {releases.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-800 p-8 text-sm text-neutral-500">
          No releases in this lane yet — it opens in a coming release.
        </p>
      )}
    </main>
  );
}
