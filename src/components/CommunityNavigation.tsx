"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ResponsiveSectionNavigation from "@/components/ResponsiveSectionNavigation";

import PortalIcon from "@/components/EcosystemPortalIcon";
import { isCommunityNavigationActive, visibleCommunityNavigationItems } from "@/lib/community-navigation";

export default function CommunityNavigation() {
  const pathname = usePathname();
  if (!(pathname === "/community" || pathname.startsWith("/community/"))) return null;

  return (
    <section className="entertainment-navigation community-navigation" data-section-theme="indigo" aria-label="Explore Community">
      <div className="shell entertainment-navigation__viewport">
        <ResponsiveSectionNavigation label="Community" current={visibleCommunityNavigationItems().find((item) => isCommunityNavigationActive(pathname, item.href))?.label ?? "Explore"} className="community-navigation__bar" ariaLabel="Community sections">
          {visibleCommunityNavigationItems().map((item) => (
            <Link href={item.href} key={item.key} className="entertainment-navigation__item" data-theme="indigo" aria-current={isCommunityNavigationActive(pathname, item.href) ? "page" : undefined}>
              <span className="entertainment-navigation__icon"><PortalIcon name={item.icon} /></span>
              <span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            </Link>
          ))}
        </ResponsiveSectionNavigation>
      </div>
    </section>
  );
}
