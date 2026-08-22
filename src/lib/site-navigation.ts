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

export function primaryHomeLabel(authenticated: boolean): "Home" | "My Home" {
  return authenticated ? "My Home" : "Home";
}

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
