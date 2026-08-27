export type EntertainmentNavIcon = "all" | "arcade" | "music" | "video";

export type EntertainmentNavItem = {
  href: string;
  label: string;
  description: string;
  icon: EntertainmentNavIcon;
  theme: "blue" | "cyan" | "indigo" | "violet" | "magenta" | "blue";
};

export const ENTERTAINMENT_NAV_ITEMS: readonly EntertainmentNavItem[] = [
  { href: "/entertainment", label: "Overview", description: "Entertainment", icon: "all", theme: "cyan" },
  { href: "/entertainment/explore", label: "Arcade", description: "Games & playable samples", icon: "arcade", theme: "cyan" },
  { href: "/audio", label: "Music", description: "Sound & signal", icon: "music", theme: "cyan" },
  { href: "/entertainment/cinema", label: "Video", description: "Watch & listen", icon: "video", theme: "cyan" },
] as const;

export const ARCADE_CATEGORIES = [
  { slug: "all", label: "Lobby" },
  { slug: "singularis", label: "Singularis" },
  { slug: "lifa", label: "Lifa" },
] as const;

export const MUSIC_CATEGORIES = [
  { slug: "all", label: "All Music" },
  { slug: "singularis", label: "Singularis" },
  { slug: "cryptic-signal", label: "Cryptic Signal" },
  { slug: "songs", label: "Songs" },
  { slug: "scores", label: "Scores" },
  { slug: "soundscapes", label: "Soundscapes" },
  { slug: "collections", label: "Collections" },
] as const;

export const VIDEO_CATEGORIES = [
  { slug: "all", label: "All Video" },
  { slug: "singularis", label: "Singularis" },
  { slug: "episodes", label: "Episodes" },
  { slug: "shorts", label: "Shorts" },
  { slug: "transmissions", label: "Transmissions" },
  { slug: "trailers", label: "Trailers" },
  { slug: "behind-the-work", label: "Behind the Work" },
  { slug: "visualizers", label: "Visualizers" },
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

export function entertainmentCategoryHref(destination: "arcade" | "music" | "video", slug: string) {
  if (destination === "arcade" && slug === "singularis") return "/products/singularis";
  if (destination === "arcade" && slug === "lifa") return "/products/lifa";
  const roots = { arcade: "/entertainment/explore", music: "/audio", video: "/entertainment/cinema" } as const;
  const queries = { arcade: "genre", music: "filter", video: "filter" } as const;
  return slug === "all" ? roots[destination] : `${roots[destination]}?${queries[destination]}=${slug}`;
}

const ENTERTAINMENT_NAV_ROOTS = ["/entertainment", "/audio", "/products", "/releases"] as const;

export function isEntertainmentNavigationRelevant(pathname: string) {
  return ENTERTAINMENT_NAV_ROOTS.some(
    (root) => pathname === root || pathname.startsWith(`${root}/`),
  );
}

export function isEntertainmentDestinationActive(pathname: string, href: string) {
  if (href === "/entertainment") {
    const arcadeFranchise = pathname.includes("singularis") || pathname === "/products/lifa" || pathname.startsWith("/products/lifa/");
    return pathname === href || ((pathname.startsWith("/products/") || pathname.startsWith("/releases/")) && !arcadeFranchise);
  }
  if (href === "/entertainment/explore" && (pathname.includes("singularis") || pathname === "/products/lifa" || pathname.startsWith("/products/lifa/"))) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}
