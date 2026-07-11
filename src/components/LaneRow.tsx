import Link from "next/link";
import ReleaseCard from "@/components/ReleaseCard";
import type { Release } from "@/lib/releases";

export default function LaneRow({
  title,
  href,
  releases,
  emptyNote,
}: {
  title: string;
  href?: string;
  releases: Release[];
  emptyNote?: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">{title}</h2>
        {href && (
          <Link
            href={href}
            className="text-sm text-accent-cyan hover:underline"
          >
            See all
          </Link>
        )}
      </div>
      {releases.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {releases.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-neutral-800 p-6 text-sm text-neutral-500">
          {emptyNote ?? "Nothing here yet."}
        </p>
      )}
    </section>
  );
}
