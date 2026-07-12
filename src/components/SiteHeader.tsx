"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Public discovery navigation: releases surface contextually through Home and Entertainment.
const NAV = [
  { href: "/", label: "My Home" },
  { href: "/entertainment", label: "Entertainment" },
  { href: "/professional", label: "Professional" },
  { href: "/account", label: "Account" },
  { href: "/search", label: "Search" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-[#02070d]/90 backdrop-blur-xl">
      <div className="shell flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-[11px] font-bold tracking-[.2em] uppercase text-foreground"
        >
          Cryptic Design
        </Link>
        <nav aria-label="Primary" className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 border-b px-2 py-4 text-[11px] font-medium tracking-wide transition-colors sm:px-3 ${
                  active
                    ? "border-accent-cyan text-accent-cyan"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
