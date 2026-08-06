import type { ArcadeCategorySlug } from "./entertainment-navigation";

export type ArcadeEntry = {
  slug: string;
  title: string;
  franchise: string;
  premise: string;
  status: "Public sample" | "In development" | "Construction";
  platform: string;
  access: string;
  categories: readonly ArcadeCategorySlug[];
  genres: readonly string[];
  href?: string;
  featured?: boolean;
};

export const ARCADE_ENTRIES: readonly ArcadeEntry[] = [
  {
    slug: "singularis-browser-prototype",
    title: "Singularis Browser Prototype",
    franchise: "Singularis",
    premise: "A music-driven vertical-shooter sample and the primary playable entry into the Singularis universe.",
    status: "Public sample",
    platform: "Web browser",
    access: "Public sample; subscriber version planned",
    categories: ["all", "singularis"],
    genres: ["Action", "Rhythm", "Shooter"],
    href: "/products/singularis",
    featured: true,
  },
  {
    slug: "singularis-future-playable",
    title: "Future Singularis Playable Experience",
    franchise: "Singularis",
    premise: "A construction space for the next approved Singularis game experience and connected Operations.",
    status: "Construction",
    platform: "Web browser target",
    access: "Subscriber access planned; public sample under review",
    categories: ["all", "singularis"],
    genres: ["Action", "Simulation", "Shooter"],
  },
  {
    slug: "lifa-genesis",
    title: "Lifa: Genesis",
    franchise: "Lifa",
    premise: "The first planned playable expression of Lifa, held as a construction page until a public prototype is approved.",
    status: "In development",
    platform: "Platform under evaluation",
    access: "Subscriber access planned; public sample under review",
    categories: ["all", "lifa"],
    genres: ["Adventure", "Strategy", "Simulation"],
    featured: true,
  },
  {
    slug: "cross-media-missions",
    title: "Cross-Media Missions",
    franchise: "Connected experiences",
    premise: "Playable narrative assignments connecting Arcade with video, music, communications, and visual content.",
    status: "Construction",
    platform: "Web browser",
    access: "Subscriber access planned; samples may be public",
    categories: ["all"],
    genres: ["Adventure", "Simulation"],
  },
  {
    slug: "interactive-experiments",
    title: "Interactive Experiments",
    franchise: "Experimental",
    premise: "Early prototypes, technical demonstrations, and research-driven playable studies clearly labeled as unfinished work.",
    status: "Construction",
    platform: "Web browser",
    access: "Public sampling when approved",
    categories: ["all"],
    genres: ["Puzzle", "Simulation"],
  },
] as const;

export function arcadeEntriesFor(category: ArcadeCategorySlug) {
  return ARCADE_ENTRIES.filter((entry) => entry.categories.includes(category));
}
