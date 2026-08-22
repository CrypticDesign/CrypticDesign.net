export const COMMUNITY_NAV_ITEMS = [
  { key: "explore", href: "/community", label: "Explore", description: "What is happening", icon: "worlds", visible: true },
  { key: "groups", href: "/community/groups", label: "Groups", description: "Shared participation", icon: "crew", visible: true },
  { key: "spaces", href: "/community/spaces", label: "Spaces", description: "Governed shared places", icon: "home", visible: false },
  { key: "events", href: "/community/events", label: "Events", description: "Scheduled participation", icon: "events", visible: true },
  { key: "creators", href: "/community/creators", label: "Creators", description: "People behind the work", icon: "discover", visible: true },
] as const;

export type CommunityNavigationItem = (typeof COMMUNITY_NAV_ITEMS)[number];

export function visibleCommunityNavigationItems() {
  return COMMUNITY_NAV_ITEMS.filter((item) => item.visible);
}

export function isCommunityNavigationActive(pathname: string, href: string) {
  if (href === "/community") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
