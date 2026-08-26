import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import { allArticles, getArticle } from "@/lib/articles";
import articleImages from "@/lib/article-images.json";

type Params = { params: Promise<{ slug: string }> };

const socialLinks: Record<string, { linkedin: string; x: string; facebook: string }> = {
  "2026-game-design-benchmarks": {
    linkedin: "https://www.linkedin.com/feed/update/urn:li:activity:7424309492084830208",
    x: "https://x.com/Cryp7icDesign/status/2018544444262273379?s=20",
    facebook: "https://www.facebook.com/share/p/1A2R9tdBtt/",
  },
  "when-tools-begin-to-decide": {
    linkedin: "https://www.linkedin.com/posts/cryptic-design_when-tools-begin-to-decide-being-human-activity-7420867704582205440-nsVm",
    x: "https://x.com/Cryp7icDesign/status/2015101652731105404?s=20",
    facebook: "https://www.facebook.com/share/p/1AqdtTXvyP/",
  },
};

export function generateStaticParams() {
  return allArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  // CRY-260: keep the SEO <title> <=60 chars and the meta description in the
  // 140-160 band. The full headline stays as the on-page H1; these are the
  // truncated search/social variants only.
  const clamp = (s: string, max: number) =>
    s.length <= max ? s : s.slice(0, max - 1).replace(/\s+\S*$/, "").trimEnd() + "…";
  const metaTitle = clamp(article.title, 60);
  const metaDescription = clamp(article.description, 158);
  return {
    // `absolute` skips the root layout's "%s | Cryptic Design" suffix so the
    // article's own headline can use the full 60-char budget (CRY-260).
    title: { absolute: metaTitle },
    description: metaDescription,
    alternates: { canonical: `/professional/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: metaTitle,
      description: metaDescription,
      publishedTime: article.published || undefined,
      images: article.hero ? [article.hero] : undefined,
    },
    twitter: { card: "summary_large_image", title: metaTitle, description: metaDescription, images: article.hero ? [article.hero] : undefined },
    authors: [{ name: "Robert K. Croft", url: "https://crypticdesign.net" }],
    keywords: [...article.categories, ...article.tags],
    robots: { index: true, follow: true },
  };
}

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

export default async function ArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const others = allArticles()
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);
  const editorialImages = (articleImages as Record<string, { src: string; alt: string }[]>)[article.slug] ?? [];
  const uniqueImages = editorialImages.filter((image, index, images) => images.findIndex((candidate) => candidate.src === image.src) === index);

  return (
    <main id="article-top" className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex max-w-4xl flex-col gap-4">
        {article.categories.length > 0 && (
          <p className="m-0 text-[10px] font-bold uppercase tracking-[.1em] text-accent-cyan">
            {article.categories.slice(0, 3).join(" · ")}
          </p>
        )}
        <h1 className="text-[38px] font-semibold leading-[1.08] text-white sm:text-[56px]">
          {article.title}
        </h1>
        <p className="m-0 text-sm text-[var(--muted)]">
          {formatDate(article.published)}
          {article.published && " · "}Robert K. Croft
        </p>
      </header>

      {article.hero && (
        <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#07111b]">
          <Image
            src={article.hero}
            alt=""
            fill
            priority
            sizes="(max-width:1200px) 100vw, 1152px"
            className="object-cover"
          />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,720px)] lg:justify-center">
        <aside className="h-fit border-t-2 border-[var(--section-accent)] pt-5 lg:sticky lg:top-32">
          <span className="kicker">Article</span>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{article.description}</p>
          <Link href="/professional/articles" className="text-link">All articles +</Link>
        </aside>
        <article><ArticleBody blocks={article.blocks} images={uniqueImages} socialLinks={socialLinks[article.slug]} /></article>
      </div>

      {article.tags.length > 0 && (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="border border-[#173049] px-2.5 py-1 text-[10px] uppercase tracking-[.06em] text-[var(--muted)]"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}

      <section className="flex flex-col gap-4 border-t border-[#173049] pt-8">
        <h2 className="text-[10px] font-bold uppercase tracking-[.1em] text-accent-cyan">
          More writing
        </h2>
        <ul className="flex list-none flex-col gap-3 p-0">
          {others.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/professional/articles/${a.slug}`}
                className="text-[15px] text-neutral-300 hover:text-white"
              >
                {a.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/professional/articles"
          className="text-sm text-accent-cyan hover:underline"
        >
          Back to Articles
        </Link>
        <Link href="/professional/services" className="text-link">Explore related capabilities</Link>
        <Link href="/professional/inquiry" className="text-link">Start a Project</Link>
      </section>
    </main>
  );
}
