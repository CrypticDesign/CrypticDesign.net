/**
 * Product & Franchise homes — per Sitemap v9 (Products and Franchises).
 * Placeholder-safe owned IP only; frontend shells until backend approval.
 */
import {
  isPubliclyRenderable,
  type PublicContentGovernance,
} from "@/lib/releases";

export interface Product extends PublicContentGovernance {
  slug: string;
  title: string;
  summary: string;
  description: string;
  status: "active" | "in-development" | "on-hold" | "reclassified" | "future";
  releaseSlugs: string[];
}

export const PRODUCTS: Product[] = [
  {
    slug: "singularis",
    title: "Singularis",
    summary: "Flagship original IP — playable, cinematic, and musical releases.",
    description:
      "Singularis is Cryptic Design's flagship original universe. Its product home gathers the vertical slice, the Overture cinematic, and the first score sketches as they release.",
    status: "in-development",
    releaseSlugs: [
      "singularis-vertical-slice",
      "singularis-overture",
      "singularis-themes-vol-1",
    ],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "lifa",
    title: "Lifa",
    summary: "An original Cryptic Design product line.",
    description:
      "Lifa's product home is reserved. Public material lands here once its first release is rights-reviewed and published.",
    status: "in-development",
    releaseSlugs: [],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "soundwave",
    title: "Soundwave",
    summary: "The audio experience powering listening across the platform.",
    description:
      "Soundwave is the audio backbone of CrypticDesign.net — shared player, catalog, and playlists. The product is currently on hold as a standalone build; its platform surfaces are represented in the Audio area.",
    status: "on-hold",
    releaseSlugs: [],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "cryptic-design-audio",
    title: "Cryptic Design Audio",
    summary: "Original scores, themes, and soundscapes from the studio.",
    description:
      "The studio's original audio output — starting with Singularis Themes, Vol. 1 — published through the platform's native audio surfaces.",
    status: "active",
    releaseSlugs: ["singularis-themes-vol-1"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "image-of-the-day",
    title: "Image of the Day",
    summary: "Reclassified into Creative Labs / Visual Studies.",
    description:
      "Image of the Day is no longer a daily program. Its archive and future selected releases live in Creative Labs as the Visual Studies series (CRY-256).",
    status: "reclassified",
    releaseSlugs: ["visual-study-01"],
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "published",
  },
];

export function publicProducts(): Product[] {
  return PRODUCTS.filter(isPubliclyRenderable);
}

export function getProduct(slug: string): Product | undefined {
  return publicProducts().find((p) => p.slug === slug);
}
