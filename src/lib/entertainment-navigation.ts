export type EntertainmentNavItem = { href: string; label: string; description: string };
export type EntertainmentNavGroup = { label: string; items: readonly EntertainmentNavItem[] };

export const ENTERTAINMENT_NAV_GROUPS: readonly EntertainmentNavGroup[] = [
  {
    label: "Channels",
    items: [
      { href: "/entertainment", label: "Entertainment Hub", description: "Featured releases and discovery" },
      { href: "/entertainment/arcade", label: "Arcade", description: "Games and playable experiences" },
      { href: "/entertainment/cinema", label: "Cinema", description: "Films, episodes, and visualizers" },
      { href: "/entertainment/listening-rooms", label: "Listening Rooms", description: "Shared and focused listening" },
      { href: "/entertainment/virtual-rooms", label: "Virtual Rooms", description: "Interactive gathering spaces" },
      { href: "/entertainment/creative-labs", label: "Creative Labs", description: "Research and experiments" },
      { href: "/library", label: "My Library", description: "Saved releases and history" },
    ],
  },
  {
    label: "Explore",
    items: [
      { href: "/releases", label: "Releases", description: "All published drops" },
      { href: "/products", label: "Products & Franchises", description: "Worlds and long-form projects" },
      { href: "/audio", label: "Cryptic Signal", description: "Music and sonic media" },
      { href: "/entertainment/visual-studies", label: "Visual Studies", description: "Rights-safe studies and process work" },
    ],
  },
] as const;

export const ENTERTAINMENT_NAV_ITEMS = ENTERTAINMENT_NAV_GROUPS.flatMap((group) => group.items);

export function isEntertainmentDestinationActive(pathname: string, href: string) {
  if (href === "/entertainment") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
