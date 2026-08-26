"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** One disclosure pattern and breakpoint for every route's section navigation. */
export default function ResponsiveSectionNavigation({ label, current, ariaLabel, className = "", children, desktopChildren }: {
  label: string;
  current: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
  desktopChildren?: ReactNode;
}) {
  const pathname = usePathname();
  return <>
    <nav className={`entertainment-navigation__bar entertainment-navigation__desktop ${className}`} aria-label={ariaLabel}>
      {desktopChildren ?? children}
    </nav>
    <details className="entertainment-navigation__menu" key={`${pathname}:${current}`}>
      <summary>{label}<span>{current}</span></summary>
      <nav className="entertainment-navigation__menu-panel" aria-label={ariaLabel} onClick={(event) => {
        if ((event.target as HTMLElement).closest("a")) event.currentTarget.closest("details")?.removeAttribute("open");
      }}>{children}</nav>
    </details>
  </>;
}
