import type { MetadataRoute } from "next";
import { ROBOTS_DISALLOW_PATHS } from "@/lib/indexing-policy";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...ROBOTS_DISALLOW_PATHS] },
    sitemap: "https://crypticdesign.net/sitemap.xml",
    host: "https://crypticdesign.net",
  };
}
