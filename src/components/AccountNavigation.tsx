"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ACCOUNT_NAV_ITEMS = [
  { href: "/account", label: "Overview" },
  { href: "/account/create", label: "Availability" },
  { href: "/account/sign-in", label: "Sign In" },
  { href: "/account/character", label: "Character" },
  { href: "/account/subscription", label: "Subscription" },
  { href: "/library", label: "Library" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountNavigation() {
  const pathname = usePathname();
  const relevant = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/library";

  if (!relevant) return null;

  return (
    <div className="account-navigation">
      <nav className="account-navigation__inner" aria-label="Account">
        {ACCOUNT_NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
