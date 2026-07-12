import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReleaseCard from "@/components/ReleaseCard";
import { getProduct, publicProducts } from "@/lib/products";
import { publicReleases } from "@/lib/releases";

export function generateStaticParams() {
  return publicProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.title,
    description: product.summary,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ release?: string }>;
}) {
  const { slug } = await params;
  const { release: selectedReleaseSlug } = await searchParams;
  const product = getProduct(slug);
  if (!product) notFound();

  const releases = publicReleases().filter((release) =>
    product.releaseSlugs.includes(release.slug),
  );
  const selectedRelease = releases.find(
    (release) => release.slug === selectedReleaseSlug,
  );
  const remainingReleases = selectedRelease
    ? releases.filter((release) => release.slug !== selectedRelease.slug)
    : releases;

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Product view · {product.status.replace("-", " ")}
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{product.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{product.description}</p>
      </header>

      {selectedRelease && (
        <section className="flex flex-col gap-4 rounded-card border border-accent-magenta bg-gradient-to-br from-neutral-950 to-neutral-900 p-6 sm:p-8">
          <span className="text-xs uppercase tracking-widest text-accent-magenta">
            Selected release · {selectedRelease.kind}
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold text-white">{selectedRelease.title}</h2>
            <p className="max-w-2xl text-muted-foreground">{selectedRelease.tagline}</p>
            <p className="max-w-2xl text-sm text-neutral-300">{selectedRelease.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/releases/${selectedRelease.slug}`} className="rounded-control bg-accent-magenta px-4 py-2 text-sm font-medium text-black hover:opacity-90">
              Open release page
            </Link>
            <Link href={`/products/${product.slug}`} className="rounded-control border border-border px-4 py-2 text-sm text-foreground hover:border-accent-cyan">
              View {product.title} product overview
            </Link>
          </div>
        </section>
      )}

      {remainingReleases.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedRelease ? `More from ${product.title}` : "Releases"}
          </h2>
          <div className="flex flex-wrap gap-4">
            {remainingReleases.map((release) => (
              <ReleaseCard key={release.slug} release={release} />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        {product.franchiseUrl && (
          <a href={product.franchiseUrl} className="text-accent-magenta hover:underline">
            Visit {product.title} franchise home ↗
          </a>
        )}
        <Link href="/products" className="text-accent-cyan hover:underline">← All products</Link>
      </div>
    </main>
  );
}
