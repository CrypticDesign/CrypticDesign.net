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
  entertainment: "Entertainment Hub",
  inquiry: "Inquiry",
  library: "My Library",
  "listening-rooms": "Listening Rooms",
  notifications: "Notifications",
  products: "Products",
  professional: "Professional Studio",
  releases: "Releases",
  settings: "Settings",
  "sign-in": "Sign In",
  subscription: "Subscription",
  "virtual-rooms": "Virtual Rooms",
};

function labelFor(segment: string) {
  return (
    LABELS[segment] ??
    segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

export default function SubNavBreadcrumbs({ position }: { position: "top" | "bottom" }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = pathname.startsWith("/releases")
    ? [
        { segment: "entertainment", href: "/entertainment" },
        ...segments.map((segment, index) => ({
          segment,
          href: `/${segments.slice(0, index + 1).join("/")}`,
        })),
      ]
    : segments.map((segment, index) => ({
        segment,
        href: `/${segments.slice(0, index + 1).join("/")}`,
      }));

  if (crumbs.length < 2) return null;

  return (
    <div className={position === "top" ? "border-b border-border" : "border-t border-border"}>
      <nav
        aria-label={`${position === "top" ? "Top" : "Bottom"} breadcrumb`}
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6"
      >
        {crumbs.map(({ segment, href }, index) => {
          const current = index === crumbs.length - 1;

          return (
            <span key={href} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden className="text-neutral-700">/</span>}
              {current ? (
                <span aria-current="page" className="text-foreground">{labelFor(segment)}</span>
              ) : (
                <Link href={href} className="transition-colors hover:text-accent-cyan">
                  {labelFor(segment)}
                </Link>
              )}
            </span>
          );
        })}
      </nav>
    </div>
  );
}
