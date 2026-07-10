import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SaveButton from "@/components/SaveButton";
import { LANES, RELEASES, getRelease } from "@/lib/releases";

export function generateStaticParams() {
  return RELEASES.map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) return {};
  return {
    title: release.title,
    description: release.tagline,
    alternates: { canonical: `/releases/${release.slug}` },
    openGraph: {
      title: release.title,
      description: release.tagline,
      type: "article",
      images: ["/share-placeholder.svg"],
    },
  };
}

export default async function ReleasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) notFound();

  const lanes = LANES.filter((lane) => release.lanes.includes(lane.slug));

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-neutral-500">
          <span>{release.kind}</span>
          {release.project && (
            <>
              <span aria-hidden>·</span>
              <span>{release.project}</span>
            </>
          )}
          <span aria-hidden>·</span>
          <time dateTime={release.releasedAt}>
            {release.status === "coming-soon" ? "Coming " : ""}
            {release.releasedAt}
          </time>
        </div>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {release.title}
        </h1>
        <p className="max-w-xl text-lg text-neutral-400">{release.tagline}</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <SaveButton slug={release.slug} />
        {lanes.map((lane) => (
          <Link
            key={lane.slug}
            href={`/personal/${lane.slug}`}
            className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-200"
          >
            {lane.name}
          </Link>
        ))}
      </div>

      <article className="max-w-2xl text-neutral-300">
        <p>{release.description}</p>
      </article>

      <footer className="border-t border-neutral-800 pt-6 text-sm">
        <Link href="/personal" className="text-accent-cyan hover:underline">
          ← Back to the Hub
        </Link>
      </footer>
    </main>
  );
}
