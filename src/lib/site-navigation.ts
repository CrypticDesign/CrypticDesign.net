export type PrimaryNavigationHref = "/" | "/entertainment" | "/community" | "/professional";

const ENTERTAINMENT_PREFIXES = [
  "/entertainment",
  "/audio",
  "/products",
  "/releases",
] as const;

const FRANCHISE_ROOTS = new Set([
  "/entertainment/lifa",
  "/entertainment/singularis",
]);

export function isPrimaryNavigationActive(
  pathname: string,
  href: PrimaryNavigationHref,
): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/entertainment") {
    return ENTERTAINMENT_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function shouldShowTopBreadcrumb(pathname: string): boolean {
  const normalizedPathname = pathname.length > 1
    ? pathname.replace(/\/$/, "")
    : pathname;

  if (ENTERTAINMENT_PREFIXES.some((prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`))) return false;
  if (FRANCHISE_ROOTS.has(normalizedPathname)) return false;
  return !/^\/products\/[^/]+$/.test(normalizedPathname);
}

/** Route identity for the compact header, independent of content-section accents. */
export function getPrimaryNavigationIdentity(pathname: string, authenticated = false) {
  if (pathname === "/") return { label: authenticated ? "My Home" : "Home", tone: authenticated ? "indigo" : "blue" };
  if (isPrimaryNavigationActive(pathname, "/entertainment")) return { label: "Explore", tone: "cyan" };
  if (isPrimaryNavigationActive(pathname, "/community")) return { label: "Community", tone: "indigo" };
  if (isPrimaryNavigationActive(pathname, "/professional")) return { label: "Professional", tone: "violet" };
  if (pathname === "/search") return { label: "Search", tone: "blue" };
  if (pathname === "/account" || pathname.startsWith("/account/") || pathname === "/library") return { label: "Account", tone: "blue" };
  return { label: "Menu", tone: "blue" };
}
