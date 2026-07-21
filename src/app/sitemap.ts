import type { MetadataRoute } from "next";
import { publicReleases } from "@/lib/releases";
import { publicProducts } from "@/lib/products";
import { allArticles } from "@/lib/articles";

const BASE = "https://crypticdesign.net";

const STATIC_ROUTES = [
  "", "/entertainment", "/entertainment/arcade", "/entertainment/cinema",
  "/entertainment/creative-labs", "/entertainment/listening-rooms",
  "/entertainment/virtual-rooms", "/entertainment/visual-studies", "/professional", "/professional/articles",
  "/professional/case-studies", "/professional/creators", "/professional/contact",
  "/professional/inquiry", "/releases", "/products", "/audio", "/search",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((path) => ({ url: `${BASE}${path || "/"}`, lastModified: now }));
  const releaseEntries = publicReleases().map((r) => ({ url: `${BASE}/releases/${r.slug}`, lastModified: now }));
  const productEntries = publicProducts().map((p) => ({ url: `${BASE}/products/${p.slug}`, lastModified: now }));
  const articleEntries = allArticles().map((a) => ({
    url: `${BASE}/professional/articles/${a.slug}`,
    lastModified: a.published ? new Date(a.published) : now,
  }));
  return [...staticEntries, ...releaseEntries, ...productEntries, ...articleEntries];
}
