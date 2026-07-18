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
    <main className="shell page-stack">
      <header className="art-field grid min-h-64 items-end border border-border p-6 sm:p-8 lg:grid-cols-[1fr_.7fr]">
        <div className="flex min-w-0 flex-col gap-3">
        <span className="eyebrow text-accent-cyan">Entertainment channel</span>
        <h1 className="display-title text-white">{title}</h1>
        <p className="max-w-2xl text-neutral-400">{description}</p>
        </div><div />
      </header>
      {releases.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>a]:w-full [&>a]:max-w-none">
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
