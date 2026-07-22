import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allArticles } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Articles & Research",
  alternates: { canonical: "/professional/articles" },
  description:
    "Writing and research from the Cryptic Design studio — UX practice, game design analysis, and creative technology.",
};

const formatDate = (iso: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

export default function ArticlesPage() {
  const [lead, ...rest] = allArticles();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6">
      <header className="flex flex-col gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[.1em] text-accent-cyan">
          Writing / research / analysis
        </span>
        <h1 className="text-3xl font-semibold text-white sm:text-[40px]">
          Articles &amp; Research
        </h1>
        <p className="m-0 max-w-2xl text-[15px] leading-relaxed text-neutral-400">
          Holistic UX practice, game design analysis, creative technology, and
          notes from building original systems.
        </p>
      </header>

      {lead && (
        <Link
          href={`/professional/articles/${lead.slug}`}
          className="feature-split group"
        >
          <div className="feature-split__image">
            {lead.hero && (
              <Image
                src={lead.hero}
                alt=""
                fill
                priority
                sizes="(max-width:900px) 100vw, 60vw"
              />
            )}
          </div>
          <div className="feature-split__content !border-l-2 !border-[#00e5ff]">
            <span className="kicker !text-[#00e5ff]">
              Latest{lead.categories[0] ? ` / ${lead.categories[0]}` : ""}
            </span>
            <h2 className="group-hover:text-white">{lead.title}</h2>
            <p>{lead.description}</p>
            <span className="text-link">
              {formatDate(lead.published)} — Read +
            </span>
          </div>
        </Link>
      )}

      <div className="media-grid">
        {rest.map((a) => (
          <Link
            key={a.slug}
            href={`/professional/articles/${a.slug}`}
            className="media-card accent-cyan"
          >
            <div className="media-card__image">
              {a.hero && (
                <Image
                  src={a.hero}
                  alt=""
                  fill
                  sizes="(max-width:640px) 100vw, 33vw"
                />
              )}
            </div>
            <div className="media-card__body">
              <span className="kicker !text-[#00e5ff]">
                {a.categories[0] || "Article"}
              </span>
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <span className="text-link">{formatDate(a.published)} — Read +</span>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/professional"
        className="text-sm text-accent-cyan hover:underline"
      >
        ← Professional Studio
      </Link>
    </main>
  );
}
