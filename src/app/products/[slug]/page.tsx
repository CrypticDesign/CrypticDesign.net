import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReleaseCard from "@/components/ReleaseCard";
import { getProduct, publicProducts } from "@/lib/products";
import { publicReleases } from "@/lib/releases";

export function generateStaticParams() {
  return publicProducts().map((p) => ({ slug: p.slug }));
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
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const releases = publicReleases().filter((r) =>
    product.releaseSlugs.includes(r.slug),
  );

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Product Home · {product.status.replace("-", " ")}
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{product.title}</h1>
        <p className="max-w-2xl text-muted-foreground">{product.description}</p>
      </header>
      {releases.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">Releases</h2>
          <div className="flex flex-wrap gap-4">
            {releases.map((r) => <ReleaseCard key={r.slug} release={r} />)}
          </div>
        </section>
      )}
      <Link href="/products" className="text-sm text-accent-cyan hover:underline">← All products</Link>
    </main>
  );
}
