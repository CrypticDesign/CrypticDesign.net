/**
 * Product & Franchise homes — contextual destinations in Sitemap v15.
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
  /** Optional owned franchise destination outside the platform shell. */
  franchiseUrl?: string;
}

export const PRODUCTS: Product[] = [
  {
    slug: "singularis",
    title: "Singularis",
    summary: "A near-future transmedia universe about humanity during technological acceleration.",
    description:
      "Singularis is a near-future science-fiction universe spanning games, animation, music, and interconnected worldbuilding systems. Set during humanity's transition into a multi-planetary civilization, it explores what happens when technology, infrastructure, automation, and planetary-scale systems begin moving faster than human institutions can coordinate or control—not after collapse, but during acceleration.",
    status: "in-development",
    releaseSlugs: [
      "singularis-vertical-slice",
      "singularis-overture",
      "singularis-themes-vol-1",
    ],
    franchiseUrl: "https://singularis.crypticdesign.net",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "lifa",
    title: "Lifa",
    summary: "A universe-building experience about creation, emergence, and life at planetary scale.",
    description:
      "Lifa is a science-driven interactive experience where players shape systems from early formation toward life-sustaining worlds. Blending simulation, strategy, and discovery, it invites players to experiment with planetary development, environmental conditions, and cosmic systems.",
    status: "in-development",
    releaseSlugs: [],
    franchiseUrl: "https://lifa.crypticdesign.net",
    rights_status: "owned",
    visibility_status: "public",
    publication_status: "scheduled",
  },
  {
    slug: "soundwave",
    title: "Soundwave",
    summary: "A music platform built to help artists create momentum and connect with audiences.",
    description:
      "Soundwave is a creator-focused music platform designed to help artists manage releases, grow audiences, and build stronger connections around their work. Its distribution, promotion, analytics, and artist tools inform listening experiences across CrypticDesign.net. The standalone product remains on hold.",
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
      "Original scores, themes, and soundscapes from Cryptic Design, beginning with Singularis Themes, Vol. 1.",
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
