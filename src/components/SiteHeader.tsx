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
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-black/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-widest uppercase text-neutral-100"
        >
          Cryptic Design
        </Link>
        <nav aria-label="Primary" className="flex flex-wrap items-center gap-1">
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
                className={`rounded px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-neutral-900 text-accent-cyan"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
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
