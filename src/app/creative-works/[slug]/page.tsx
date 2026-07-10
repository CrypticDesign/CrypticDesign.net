import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReleaseCard from "@/components/ReleaseCard";
import { getRelease } from "@/lib/releases";
import { getWork, publicWorks } from "@/lib/works";

export function generateStaticParams() {
  return publicWorks().map((work) => ({ slug: work.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};

  return {
    title: work.title,
    description: work.summary,
    alternates: { canonical: `/creative-works/${work.slug}` },
  };
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  const releases = work.releaseSlugs
    .map(getRelease)
    .filter((release) => release !== undefined);

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex max-w-3xl flex-col gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {work.kind}
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {work.title}
        </h1>
        <p className="text-lg text-neutral-400">{work.summary}</p>
      </header>
      <article className="max-w-2xl text-neutral-300">
        <p>{work.description}</p>
      </article>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Related releases</h2>
        {releases.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {releases.map((release) => (
              <ReleaseCard key={release.slug} release={release} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No public releases are available for this work yet.
          </p>
        )}
      </section>
      <Link href="/creative-works" className="w-fit text-sm text-accent-cyan hover:underline">
        Back to Creative Works
      </Link>
    </main>
  );
}
