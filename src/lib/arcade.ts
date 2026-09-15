import type { ArcadeCategorySlug } from "./entertainment-navigation";

export type ArcadeEntry = {
  slug: string;
  title: string;
  franchise: string;
  premise: string;
  status: "Coming soon" | "In development" | "Construction";
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
    premise: "A music-driven vertical-shooter experience in active development inside the Singularis universe.",
    status: "Coming soon",
    platform: "Web browser",
    access: "Public discovery; separately authorized development access",
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
    access: "Public discovery; execution remains closed until approved",
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
    access: "Public discovery; execution remains closed until approved",
    categories: ["all", "lifa"],
    genres: ["Adventure", "Strategy", "Simulation"],
    featured: true,
  },
  {
    slug: "cross-media-missions",
    title: "Cross-Media Missions",
    franchise: "Connected experiences",
    premise: "Playable narrative assignments connecting Explore with video, music, communications, and visual content.",
    status: "Construction",
    platform: "Web browser",
    access: "Public discovery; execution remains closed until approved",
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
    access: "Public discovery; execution remains closed until approved",
    categories: ["all"],
    genres: ["Puzzle", "Simulation"],
  },
] as const;

export function arcadeEntriesFor(category: ArcadeCategorySlug) {
  return ARCADE_ENTRIES.filter((entry) => entry.categories.includes(category));
}
