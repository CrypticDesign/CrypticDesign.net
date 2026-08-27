import type { Article } from "./articles";

// Presentation only: imported bodies, descriptions, tags and SEO data stay intact.
const excerpts: Record<string, string> = {
  "ai-in-ux-design": "Personalization, predictive interfaces, and ethical questions in AI-assisted user experience design.",
  "scalable-ui-systems-design-tokens-components": "How design tokens and reusable components help interface systems stay consistent as products grow.",
  "how-to-conduct-a-ux-audit": "A practical approach to heuristic evaluation, usability testing, analytics, and user research.",
  "holistic-ux-design-systems-thinking": "Connecting research, strategy, interaction design, and iteration through systems thinking.",
  "video-games-2023-q1-cryptic-insights": "A Q1 2023 perspective on AI-assisted development, live-service games, independent studios, and cross-platform play.",
  "artificial-intelligence-2023-q1-cryptic-insights": "A Q1 2023 overview of AI tools, key players, and philosophical questions.",
};
export function articleCardExcerpt(article: Article): string {
  return excerpts[article.slug] ?? article.description.replace(/#[\p{L}\p{N}_-]+/gu, "").trim();
}
export function articleCardTitle(article: Article): string { return article.title.replace(/#[\p{L}\p{N}_-]+/gu, "").trim(); }
export function curateProfessionalArticles(articles: Article[]) {
  const sorted = [...articles].sort((a,b) => b.published.localeCompare(a.published));
  return { featured: sorted.slice(0,4), archive: sorted.slice(4) };
}
