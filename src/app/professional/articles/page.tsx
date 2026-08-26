import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allArticles, type Article } from "@/lib/articles";
import { articleCardExcerpt, articleCardTitle, curateProfessionalArticles } from "@/lib/professional-articles";
import { professionalCopy as copy } from "@/lib/professional-copy";
export const metadata: Metadata = {
  title: "Articles & Research",
  alternates: { canonical: "/professional/articles" }, openGraph: { title: "Articles & Research", description: "UX, game-design, systems-thinking, and creative-technology research from Cryptic Design.", url: "/professional/articles", images: ["/share/articles.png"] }, twitter: { card: "summary_large_image", images: ["/share/articles.png"] }, robots: { index: true, follow: true },
  description: "Writing and research from the Cryptic Design studio: holistic UX practice, game design analysis, creative technology, and notes from building original systems.",
};

const formatDate = (iso: string) => new Date(iso + "T00:00:00Z").toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
function ArticleCard({ article }: { article: Article }) {
  return <Link href={"/professional/articles/" + article.slug} className="media-card accent-violet"><div className="media-card__image"><Image src={article.hero} alt="" fill sizes="(max-width:640px) 100vw, 33vw" /></div><div className="media-card__body"><span className="kicker">{article.categories[0] || "Research"}</span><h3>{articleCardTitle(article)}</h3><p>{articleCardExcerpt(article)}</p><span className="text-link"><time dateTime={article.published}>{formatDate(article.published)}</time> — Read Article</span></div></Link>;
}
export default function ArticlesPage() {
  const { featured, archive } = curateProfessionalArticles(allArticles());
  const [lead, ...rest] = featured;
  return <main className="shell page-stack"><header><span className="kicker">Articles / Research</span><h1 className="display-title">{copy.articles.title}</h1><p className="mt-5 max-w-3xl text-lg leading-relaxed text-[var(--muted)]">{copy.articles.lead}</p></header>
    <section aria-labelledby="current-thinking"><h2 id="current-thinking" className="section-title mb-6">Current perspectives</h2>
      {lead && <Link href={"/professional/articles/" + lead.slug} className="feature-split mb-6"><div className="feature-split__image"><Image src={lead.hero} alt="" fill priority sizes="(max-width:900px) 100vw, 60vw" /></div><div className="feature-split__content"><span className="kicker">Featured / {lead.categories[0]}</span><h3 className="my-4 text-3xl font-semibold">{articleCardTitle(lead)}</h3><p>{articleCardExcerpt(lead)}</p><span className="text-link"><time dateTime={lead.published}>{formatDate(lead.published)}</time> — Read Article</span></div></Link>}
      <div className="media-grid">{rest.map(article => <ArticleCard key={article.slug} article={article} />)}</div>
    </section>
    <section aria-labelledby="research-archive"><h2 id="research-archive" className="section-title">Research archive</h2><p className="mb-6 mt-3 text-[var(--muted)]">Earlier writing, preserved with its original publication context.</p><div className="media-grid">{archive.map(article => <ArticleCard key={article.slug} article={article} />)}</div></section>
    <div className="hero-actions"><Link href="/professional/services" className="button secondary">Explore Services</Link><Link href="/professional/inquiry" className="button">Start a Project</Link></div>
  </main>;
}
