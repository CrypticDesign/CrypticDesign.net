import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import { allArticles, getArticle } from "@/lib/articles";
import articleImages from "@/lib/article-images.json";

type Params = { params: Promise<{ slug: string }> };

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
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex max-w-4xl flex-col gap-4">
        {article.categories.length > 0 && (
          <p className="m-0 text-[10px] font-bold uppercase tracking-[.1em] text-accent-cyan">
            {article.categories.slice(0, 3).join(" · ")}
          </p>
        )}
        <h1 className="text-[38px] font-semibold leading-[1.08] text-white sm:text-[56px]">
          {article.title}
        </h1>
        <p className="m-0 text-sm text-neutral-500">
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
        <aside className="h-fit border-t-2 border-[#ed00a8] pt-5 lg:sticky lg:top-32">
          <span className="kicker !text-[#ed00a8]">Article</span>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">{article.description}</p>
          <Link href="/professional/articles" className="text-link">All articles +</Link>
        </aside>
        <article><ArticleBody blocks={article.blocks} images={uniqueImages} /></article>
      </div>

      {article.tags.length > 0 && (
        <ul className="flex list-none flex-wrap gap-2 p-0">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="border border-[#173049] px-2.5 py-1 text-[10px] uppercase tracking-[.06em] text-neutral-500"
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
          ← All articles
        </Link>
      </section>
    </main>
  );
}
