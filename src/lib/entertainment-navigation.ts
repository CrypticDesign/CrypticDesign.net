export type EntertainmentNavIcon = "all" | "arcade" | "music" | "video";

export type EntertainmentNavItem = {
  href: string;
  label: string;
  description: string;
  icon: EntertainmentNavIcon;
  theme: "cyan" | "violet" | "gold" | "blue";
};

export const ENTERTAINMENT_NAV_ITEMS: readonly EntertainmentNavItem[] = [
  { href: "/entertainment", label: "Overview", description: "Entertainment", icon: "all", theme: "cyan" },
  { href: "/entertainment/arcade", label: "Arcade", description: "Games & challenges", icon: "arcade", theme: "violet" },
  { href: "/audio", label: "Music", description: "Sound & signal", icon: "music", theme: "gold" },
  { href: "/entertainment/cinema", label: "Video", description: "Watch & listen", icon: "video", theme: "blue" },
] as const;

export const ARCADE_CATEGORIES = [
  { slug: "all", label: "Lobby" },
  { slug: "featured", label: "Featured" },
  { slug: "singularis", label: "Singularis" },
  { slug: "lifa", label: "Lifa" },
  { slug: "cryptic-originals", label: "Cryptic Originals" },
  { slug: "missions", label: "Missions" },
  { slug: "experiments", label: "Experiments" },
  { slug: "coming-soon", label: "Coming Soon" },
] as const;

export const MUSIC_CATEGORIES = [
  { slug: "all", label: "All Music" },
  { slug: "featured", label: "Featured" },
  { slug: "singularis", label: "Singularis" },
  { slug: "cryptic-signal", label: "Cryptic Signal" },
  { slug: "songs", label: "Songs" },
  { slug: "scores", label: "Scores" },
  { slug: "soundscapes", label: "Soundscapes" },
  { slug: "collections", label: "Collections" },
  { slug: "coming-soon", label: "Coming Soon" },
] as const;

export const VIDEO_CATEGORIES = [
  { slug: "all", label: "All Video" },
  { slug: "featured", label: "Featured" },
  { slug: "singularis", label: "Singularis" },
  { slug: "episodes", label: "Episodes" },
  { slug: "shorts", label: "Shorts" },
  { slug: "transmissions", label: "Transmissions" },
  { slug: "trailers", label: "Trailers" },
  { slug: "behind-the-work", label: "Behind the Work" },
  { slug: "visualizers", label: "Visualizers" },
  { slug: "coming-soon", label: "Coming Soon" },
] as const;

export const ARCADE_GENRES = ["Action", "Adventure", "Strategy", "RPG", "Puzzle", "Simulation", "Rhythm", "Shooter"] as const;

export type ArcadeCategorySlug = (typeof ARCADE_CATEGORIES)[number]["slug"];
export type MusicCategorySlug = (typeof MUSIC_CATEGORIES)[number]["slug"];
export type VideoCategorySlug = (typeof VIDEO_CATEGORIES)[number]["slug"];

export function arcadeCategory(slug: string | undefined) {
  return ARCADE_CATEGORIES.find((category) => category.slug === slug);
}

export function musicCategory(slug: string | undefined) {
  return MUSIC_CATEGORIES.find((category) => category.slug === slug);
}

export function videoCategory(slug: string | undefined) {
  return VIDEO_CATEGORIES.find((category) => category.slug === slug);
}

const ENTERTAINMENT_NAV_ROOTS = ["/entertainment", "/audio", "/products", "/releases", "/library"] as const;

export function isEntertainmentNavigationRelevant(pathname: string) {
  return ENTERTAINMENT_NAV_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function isEntertainmentDestinationActive(pathname: string, href: string) {
  if (href === "/entertainment") {
    return pathname === href || ((pathname.startsWith("/products/") || pathname.startsWith("/releases/")) && !pathname.includes("singularis"));
  }
  if (href === "/entertainment/arcade" && pathname.includes("singularis")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
