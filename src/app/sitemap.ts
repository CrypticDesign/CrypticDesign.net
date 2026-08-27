import { publicServices } from "@/lib/services";
import type { MetadataRoute } from "next";
import { publicReleases, releaseDestination } from "@/lib/releases";
import { publicProducts } from "@/lib/products";
import { allArticles } from "@/lib/articles";

const BASE = "https://crypticdesign.net";

const STATIC_ROUTES = [
  "", "/community", "/community/groups", "/community/events", "/community/creators", "/entertainment", "/entertainment/explore", "/entertainment/cinema",
  "/entertainment/creative-labs", "/entertainment/listening-rooms",
  "/entertainment/virtual-rooms", "/entertainment/visual-studies", "/entertainment/store",
  "/professional", "/professional/services", "/professional/articles", "/privacy", "/terms",
  "/professional/case-studies", "/professional/creators",
  "/professional/inquiry", "/releases", "/products", "/audio", "/search",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticEntries = STATIC_ROUTES.map((path) => ({ url: `${BASE}${path || "/"}`, lastModified: now }));
  const releaseEntries = publicReleases()
    .map((release) => releaseDestination(release))
    .filter((path) => path.startsWith("/releases/"))
    .map((path) => ({ url: `${BASE}${path}`, lastModified: now }));
  const productEntries = publicProducts().map((p) => ({ url: `${BASE}/products/${p.slug}`, lastModified: now }));
  const articleEntries = allArticles().map((a) => ({
    url: `${BASE}/professional/articles/${a.slug}`,
    lastModified: a.published ? new Date(a.published) : now,
  }));
  const serviceEntries = publicServices().map(service => ({ url: `${BASE}/professional/${service.slug}`, lastModified: now }));
  return [...staticEntries, ...releaseEntries, ...productEntries, ...articleEntries, ...serviceEntries];
}
