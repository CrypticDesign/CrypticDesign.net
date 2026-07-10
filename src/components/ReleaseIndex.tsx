import ReleaseCard from "@/components/ReleaseCard";
import type { Release } from "@/lib/releases";

export default function ReleaseIndex({
  title,
  description,
  releases,
  emptyNote = "Nothing is available here yet.",
}: {
  title: string;
  description: string;
  releases: Release[];
  emptyNote?: string;
}) {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-white">{title}</h1>
        <p className="max-w-2xl text-neutral-400">{description}</p>
      </header>
      {releases.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {releases.map((release) => (
            <ReleaseCard key={release.slug} release={release} />
          ))}
        </div>
      ) : (
        <p className="rounded-card border border-dashed border-border p-8 text-sm text-muted-foreground">
          {emptyNote}
        </p>
      )}
    </main>
  );
}
