"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const serviceSlugs = new Set(["product-strategy", "ux-interaction", "interface-systems", "creative-technology"]);
const items = [
  { label: "Overview", href: "/professional" },
  { label: "Services", href: "/professional#services" },
  { label: "Case Studies", href: "/professional/case-studies" },
  { label: "Articles", href: "/professional/articles" },
  { label: "Start a Project", href: "/professional/inquiry" },
];

export default function ProfessionalNavigation() {
  const pathname = usePathname();
  const segment = pathname.split("/")[2] ?? "";
  const active = (href: string) => href.includes("#services")
    ? serviceSlugs.has(segment)
    : href === "/professional"
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <section className="sticky top-[58px] z-40 border-y border-[#ed00a8]/25 bg-[#06101a]/95 shadow-[0_10px_24px_rgba(0,0,0,.65)] backdrop-blur" aria-label="Professional navigation">
      <nav className="shell flex overflow-x-auto" aria-label="Professional sections">
        {items.map((item) => (
          <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} className="relative flex min-h-14 shrink-0 items-center px-5 text-[10px] font-bold uppercase tracking-[.09em] text-[var(--muted)] transition hover:bg-[#ed00a8]/10 hover:text-[#ed00a8] aria-[current=page]:bg-[#ed00a8]/10 aria-[current=page]:text-[#ed00a8] after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-transparent aria-[current=page]:after:bg-[#ed00a8]">
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
