"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import PortalIcon from "@/components/EcosystemPortalIcon";
import { isCommunityNavigationActive, visibleCommunityNavigationItems } from "@/lib/community-navigation";

export default function CommunityNavigation() {
  const pathname = usePathname();
  if (!(pathname === "/community" || pathname.startsWith("/community/"))) return null;

  return (
    <section className="entertainment-navigation community-navigation" data-section-theme="violet" aria-label="Explore Community">
      <div className="shell entertainment-navigation__viewport">
        <nav className="entertainment-navigation__bar community-navigation__bar" aria-label="Community sections">
          {visibleCommunityNavigationItems().map((item) => (
            <Link href={item.href} key={item.key} className="entertainment-navigation__item" data-theme="violet" aria-current={isCommunityNavigationActive(pathname, item.href) ? "page" : undefined}>
              <span className="entertainment-navigation__icon"><PortalIcon name={item.icon} /></span>
              <span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
