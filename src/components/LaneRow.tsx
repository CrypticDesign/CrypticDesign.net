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
    <section className="flex flex-col gap-5">
      <div className="flex items-baseline justify-between">
        <h2 className="section-title text-foreground">{title}</h2>
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
        <div className="flex gap-4 overflow-x-auto pb-3 [scrollbar-color:#173044_transparent]">
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
