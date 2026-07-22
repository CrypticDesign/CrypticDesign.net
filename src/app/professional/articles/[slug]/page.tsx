import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleBody from "@/components/ArticleBody";
import { allArticles, getArticle } from "@/lib/articles";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/professional/articles/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.description,
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6">
      <nav
        aria-label="Breadcrumb"
        className="text-[10px] uppercase tracking-[.1em] text-neutral-500"
      >
        <Link href="/professional" className="hover:text-white">
          Professional
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <Link href="/professional/articles" className="hover:text-white">
          Articles
        </Link>
      </nav>

      <header className="flex flex-col gap-4">
        {article.categories.length > 0 && (
          <p className="m-0 text-[10px] font-bold uppercase tracking-[.1em] text-accent-cyan">
            {article.categories.slice(0, 3).join(" · ")}
          </p>
        )}
        <h1 className="text-[34px] font-semibold leading-[1.15] text-white sm:text-[42px]">
          {article.title}
        </h1>
        <p className="m-0 text-sm text-neutral-500">
          {formatDate(article.published)}
          {article.published && " · "}Robert K. Croft
        </p>
      </header>

      {article.hero && (
        <div className="relative aspect-[16/9] w-full overflow-hidden border border-[#173049]">
          <Image
            src={article.hero}
            alt=""
            fill
            priority
            sizes="(max-width:900px) 100vw, 768px"
            className="object-cover"
          />
        </div>
      )}

      <article>
        <ArticleBody blocks={article.blocks} />
      </article>

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
