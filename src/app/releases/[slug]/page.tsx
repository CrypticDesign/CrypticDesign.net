import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReleaseCard from "@/components/ReleaseCard";
import SaveButton from "@/components/SaveButton";
import { getProduct } from "@/lib/products";
import { LANES, getRelease, publicReleases, releaseImage } from "@/lib/releases";

export function generateStaticParams() {
  return publicReleases().map((release) => ({ slug: release.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) return {};
  return {
    title: release.title,
    description: release.tagline,
    alternates: { canonical: `/releases/${release.slug}` },
    openGraph: { title: release.title, description: release.tagline, type: "article", images: [releaseImage(release)] },
  };
}

export default async function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const release = getRelease(slug);
  if (!release) notFound();

  const product = release.productSlug ? getProduct(release.productSlug) : undefined;
  const lanes = LANES.filter((lane) => release.lanes.includes(lane.slug));
  const related = publicReleases().filter((item) => item.slug !== release.slug && item.productSlug === release.productSlug);

  return (
    <main>
      <section className="visual-hero !min-h-[600px]">
        <div className="visual-hero__image"><Image src={releaseImage(release)} alt="" fill priority sizes="100vw" /></div>
        <div className="visual-hero__wash" />
        <div className="visual-hero__content">
          <div className="signal-rail text-[#ed00a8]" />
          <span className="kicker">{release.kind} / {release.status.replace("-", " ")}</span>
          <h1 className="display-title">{release.title}</h1>
          <p>{release.tagline}</p>
          <div className="hero-actions">
            <SaveButton slug={release.slug} />
            {product && <Link href={`/products/${product.slug}?release=${release.slug}`} className="button">Explore {product.title}</Link>}
          </div>
        </div>
      </section>

      <div className="shell page-stack">
        <section className="feature-split">
          <div className="feature-split__image"><Image src={releaseImage(release)} alt="" fill sizes="(max-width:900px) 100vw, 60vw" /></div>
          <div className="feature-split__content">
            <span className="kicker">Selected release</span>
            <h2>{release.title}</h2>
            <p>{release.description}</p>
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              {lanes.map((lane) => <span key={lane.slug} className="border border-border px-3 py-2">{lane.name}</span>)}
              <time dateTime={release.releasedAt} className="border border-border px-3 py-2">{release.status === "coming-soon" ? "Coming " : "Released "}{release.releasedAt}</time>
            </div>
          </div>
        </section>

        {product && <section className="panel grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><span className="kicker !text-[#ed00a8]">Part of the {product.title} franchise</span><h2 className="section-title mt-2">Continue into the wider universe.</h2><p className="max-w-2xl text-muted-foreground">{product.summary}</p></div>
          <Link href={`/products/${product.slug}?release=${release.slug}`} className="button">View {product.title}</Link>
        </section>}

        {related.length > 0 && <section><div className="section-heading"><div><span className="kicker">Related releases</span><h2 className="section-title">More from {product?.title}</h2></div></div><div className="flex flex-wrap gap-4">{related.map((item) => <ReleaseCard key={item.slug} release={item} />)}</div></section>}

        <Link href="/entertainment" className="text-link">← Entertainment Hub</Link>
      </div>
    </main>
  );
}
