"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  account: "Account",
  arcade: "Arcade",
  articles: "Articles & Research",
  audio: "Audio",
  character: "Character Profile",
  cinema: "Cinema",
  contact: "Contact",
  "create-character": "Create Character",
  "creative-labs": "Creative Labs",
  creators: "Contributing Creators",
  "creator-tools": "Creator Tools",
  entertainment: "Entertainment Hub",
  inquiry: "Inquiry",
  library: "My Library",
  "listening-rooms": "Listening Rooms",
  "my-home": "My Home",
  notifications: "Notifications",
  products: "Products",
  professional: "Professional",
  releases: "Releases",
  request: "Creator Access Request",
  settings: "Settings",
  "sign-in": "Sign In",
  subscription: "Subscription",
  "virtual-rooms": "Virtual Rooms",
};

type Crumb = { segment: string; href: string };

function labelFor(segment: string) {
  return LABELS[segment] ?? segment.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

function routeCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const route = segments.map((segment, index) => ({ segment, href: `/${segments.slice(0, index + 1).join("/")}` }));
  const first = segments[0];

  if (pathname === "/creator-tools/request") {
    return [
      { segment: "professional", href: "/professional" },
      { segment: "creators", href: "/professional/creators" },
      { segment: "request", href: pathname },
    ];
  }

  if (["releases", "products", "audio"].includes(first)) {
    return [{ segment: "entertainment", href: "/entertainment" }, ...route];
  }
  if (["account", "library"].includes(first)) {
    return [{ segment: "my-home", href: "/" }, ...route];
  }
  return route;
}

export default function SubNavBreadcrumbs({ position }: { position: "top" | "bottom" }) {
  const pathname = usePathname();
  const crumbs = routeCrumbs(pathname);

  if (crumbs.length < 2) return null;

  return (
    <div className={position === "top" ? "border-b border-border/70 bg-surface/30" : "border-t border-border/70 bg-surface/20"}>
      <nav aria-label={`${position === "top" ? "Top" : "Bottom"} breadcrumb`} className="shell flex flex-wrap items-center gap-2 py-2.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {crumbs.map(({ segment, href }, index) => {
          const current = index === crumbs.length - 1;
          return (
            <span key={`${href}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden className="text-neutral-700">/</span>}
              {current ? <span aria-current="page" className="text-foreground">{labelFor(segment)}</span> : <Link href={href} className="transition-colors hover:text-accent-cyan">{labelFor(segment)}</Link>}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
