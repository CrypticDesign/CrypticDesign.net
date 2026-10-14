import { allArticles } from "@/lib/articles";
import { publicProducts } from "@/lib/products";
import { publicReleases, releaseDestination } from "@/lib/releases";
import { publicServices } from "@/lib/services";
import type { PublicSearchRecord } from "@/lib/search-contract";

function byTitle(a: PublicSearchRecord, b: PublicSearchRecord): number {
  return a.title.localeCompare(b.title);
}

export function publicSearchIndex(): PublicSearchRecord[] {
  const releases: PublicSearchRecord[] = publicReleases()
    .filter((release) => release.visibility_status === "public")
    .map((release) => ({
      id: `release:${release.slug}`,
      category: "release",
      title: release.title,
      summary: release.tagline,
      href: releaseDestination(release),
      keywords: [release.kind, ...release.lanes, release.project ?? "", release.productSlug ?? ""],
      availability: release.status === "released" && release.publication_status === "published" ? "available" : "preview",
      access: "public",
    }));

  const worlds: PublicSearchRecord[] = publicProducts()
    .filter((product) => product.visibility_status === "public")
    .map((product) => ({
      id: `world:${product.slug}`,
      category: "world",
      title: product.title,
      summary: product.summary,
      href: `/products/${product.slug}`,
      keywords: [product.status, "world", "product", "franchise"],
      availability: product.status === "active" && product.publication_status === "published" ? "available" : "preview",
      access: "public",
    }));

  const articles: PublicSearchRecord[] = allArticles().map((article) => ({
    id: `article:${article.slug}`,
    category: "article",
    title: article.title,
    summary: article.description,
    href: `/professional/articles/${article.slug}`,
    keywords: [...article.categories, ...article.tags],
    availability: "available",
    access: "public",
  }));

  const services: PublicSearchRecord[] = publicServices()
    .filter((service) => service.visibility_status === "public")
    .map((service) => ({
      id: `service:${service.slug}`,
      category: "service",
      title: service.title,
      summary: service.summary,
      href: `/professional/${service.slug}`,
      keywords: [...service.capabilities, ...service.engagements],
      availability: "available",
      access: "public",
    }));

  return [...releases, ...worlds, ...articles, ...services].sort(byTitle);
}
