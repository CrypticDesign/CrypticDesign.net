"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ARCADE_CATEGORIES, ENTERTAINMENT_NAV_ITEMS, MUSIC_CATEGORIES, VIDEO_CATEGORIES, arcadeCategory, entertainmentCategoryHref, musicCategory, videoCategory, isEntertainmentDestinationActive, isEntertainmentNavigationRelevant, type ArcadeCategorySlug, type EntertainmentNavIcon } from "@/lib/entertainment-navigation";

const destinationCategories = { arcade: ARCADE_CATEGORIES, music: MUSIC_CATEGORIES, video: VIDEO_CATEGORIES } as const;
const destinationQueries = { arcade: "genre", music: "filter", video: "filter" } as const;

function NavIcon({ icon }: { icon: EntertainmentNavIcon }) {
  if (icon === "arcade") return <svg viewBox="0 0 32 32" aria-hidden><path d="M9 11h14l5 12-3 3-6-5h-6l-6 5-3-3 5-12Z"/><path d="M10 16h6M13 13v6M22 15v.1M25 18v.1"/></svg>;
  if (icon === "music") return <svg viewBox="0 0 32 32" aria-hidden><path d="M12 24V9l14-3v15M12 13l14-3"/><circle cx="8.5" cy="24.5" r="3.5"/><circle cx="22.5" cy="21.5" r="3.5"/></svg>;
  if (icon === "video") return <svg viewBox="0 0 32 32" aria-hidden><rect x="4" y="8" width="20" height="16" rx="1"/><path d="m13 13 6 3-6 3v-6ZM24 13l5-3v12l-5-3"/></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden><path d="M16 3v26M3 16h26M7 7l18 18M25 7 7 25"/><circle cx="16" cy="16" r="6"/></svg>;
}

export default function EntertainmentNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(true);
  const [, setArcadeMenuOpen] = useState(false);
  const [openDestination, setOpenDestination] = useState<"arcade" | "music" | "video" | null>(null);
  const [selectedArcadeCategory, setSelectedArcadeCategory] = useState<ArcadeCategorySlug>("all");
  const singularisRoute = pathname.includes("singularis");
  const lifaRoute = pathname === "/products/lifa" || pathname.startsWith("/products/lifa/");
  const arcadeFranchiseRoute = singularisRoute || lifaRoute;

  useEffect(() => {
    setSelectedArcadeCategory(singularisRoute ? "singularis" : lifaRoute ? "lifa" : arcadeCategory(searchParams.get("genre") ?? undefined)?.slug ?? "all");
  }, [searchParams, singularisRoute, lifaRoute]);

  useEffect(() => {
    function syncCategoryDrawer(event: Event) {
      setCategoryDrawerOpen(Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open));
    }
    window.addEventListener("cryptic:entertainment-drawer", syncCategoryDrawer);
    return () => window.removeEventListener("cryptic:entertainment-drawer", syncCategoryDrawer);
  }, []);

  useEffect(() => {
    const open = arcadeFranchiseRoute || pathname === "/entertainment/explore" || pathname.startsWith("/entertainment/explore/");
    setArcadeMenuOpen(open);
    setOpenDestination(open ? "arcade" : pathname === "/audio" || pathname.startsWith("/audio/") ? "music" : pathname === "/entertainment/cinema" || pathname.startsWith("/entertainment/cinema/") ? "video" : null);
    window.dispatchEvent(new CustomEvent("cryptic:arcade-drawer", { detail: { open } }));
  }, [pathname, arcadeFranchiseRoute]);

  if (!isEntertainmentNavigationRelevant(pathname)) return null;
  const activeItem = ENTERTAINMENT_NAV_ITEMS.find((item) =>
    isEntertainmentDestinationActive(pathname, item.href),
  );

  const renderDestinations = (surface: "desktop" | "mobile") => ENTERTAINMENT_NAV_ITEMS.map((item) => {
    const active = isEntertainmentDestinationActive(pathname, item.href);
    if (item.icon === "arcade" || item.icon === "music" || item.icon === "video") {
      const destinationIcon = item.icon;
      const categories = destinationCategories[item.icon];
      const query = destinationQueries[item.icon];
      const drawerOpen = openDestination === item.icon;
      const selected = item.icon === "arcade" ? selectedArcadeCategory : item.icon === "music" ? (musicCategory(searchParams.get(query) ?? undefined)?.slug ?? "all") : (videoCategory(searchParams.get(query) ?? undefined)?.slug ?? "all");
      return (
        <details key={item.href} className="entertainment-navigation__item-drawer" data-theme={item.theme} data-open={drawerOpen} open>
          <summary className="entertainment-navigation__item" data-theme={item.theme} aria-current={active ? "page" : undefined} aria-expanded={drawerOpen} aria-controls={`${item.icon}-destination-drawer-${surface}`} onClick={(event) => { event.preventDefault(); const onRoute = pathname === item.href || pathname.startsWith(`${item.href}/`); setOpenDestination(destinationIcon); if (destinationIcon === "arcade") { setArcadeMenuOpen(true); window.dispatchEvent(new CustomEvent("cryptic:arcade-drawer", { detail: { open: true } })); } if (!onRoute || searchParams.has(query)) router.push(item.href); }}>
            <span className="entertainment-navigation__icon"><NavIcon icon={item.icon} /></span>
            <span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
          </summary>
          <nav id={`${item.icon}-destination-drawer-${surface}`} className="entertainment-navigation__item-options" data-open={drawerOpen} aria-hidden={!drawerOpen} aria-label={`${item.label} drawer`}>
            {categories.map((category) => (
              <Link
                href={entertainmentCategoryHref(destinationIcon, category.slug)}
                key={category.slug}
                aria-current={category.slug === selected ? "page" : undefined}
              >
                {category.label}
              </Link>
            ))}
          </nav>
        </details>
      );
    }
    return (
      <Link href={item.href} key={item.href} className="entertainment-navigation__item" data-theme={item.theme} aria-current={active ? "page" : undefined}>
        <span className="entertainment-navigation__icon"><NavIcon icon={item.icon} /></span>
        <span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
      </Link>
    );
  });

  const compactItem = ENTERTAINMENT_NAV_ITEMS.find((item) => item.icon === openDestination);
  const compactCategories = openDestination ? destinationCategories[openDestination] : null;
  const compactQuery = openDestination ? destinationQueries[openDestination] : null;
  const compactSelected = openDestination === "arcade" ? selectedArcadeCategory : openDestination === "music" ? (musicCategory(searchParams.get("filter") ?? undefined)?.slug ?? "all") : (videoCategory(searchParams.get("filter") ?? undefined)?.slug ?? "all");
  const compactArcadeMenu = compactItem && compactCategories && compactQuery && openDestination ? <details className="arcade-filter-menu" data-theme={compactItem.theme}>
    <summary><span>{compactItem.label} navigation</span><strong>{compactCategories.find((category) => category.slug === compactSelected)?.label}</strong></summary><nav aria-label={`Compact ${compactItem.label} navigation`}>{compactCategories.map((category) => <Link href={entertainmentCategoryHref(openDestination, category.slug)} key={category.slug} aria-current={category.slug === compactSelected ? "page" : undefined}>{category.label}</Link>)}</nav>
  </details> : null;

  return (
    <section id="entertainment-category-drawer" className="entertainment-navigation" data-open={categoryDrawerOpen} data-franchise={arcadeFranchiseRoute || undefined} data-section-theme={activeItem?.theme ?? "blue"} aria-label="Explore Entertainment">
      <div className="shell entertainment-navigation__viewport">
        <nav className="entertainment-navigation__bar entertainment-navigation__desktop" aria-label="Entertainment destinations">{renderDestinations("desktop")}</nav>
        <details className="entertainment-navigation__menu">
          <summary>Entertainment <span>{activeItem?.label ?? "Browse"}</span></summary>
          <nav className="entertainment-navigation__menu-panel" aria-label="Entertainment destinations">{renderDestinations("mobile")}</nav>
        </details>
        {compactArcadeMenu}
      </div>
    </section>
  );
}
