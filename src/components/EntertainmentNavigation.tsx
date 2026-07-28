"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ENTERTAINMENT_NAV_GROUPS, ENTERTAINMENT_NAV_ITEMS, isEntertainmentDestinationActive } from "@/lib/entertainment-navigation";

export default function EntertainmentNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = ENTERTAINMENT_NAV_ITEMS.find((item) => isEntertainmentDestinationActive(pathname, item.href));

  return (
    <section className="entertainment-navigation" aria-labelledby="entertainment-navigation-title">
      <div className="shell">
        <button type="button" className="entertainment-navigation__trigger" aria-controls="entertainment-navigation-panel" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span>
            <strong id="entertainment-navigation-title">Explore Entertainment</strong>
            <small>{current ? `Current: ${current.label}` : "Choose a destination"}</small>
          </span>
          <span className="entertainment-navigation__chevron" aria-hidden />
        </button>

        <nav id="entertainment-navigation-panel" className="entertainment-navigation__panel" data-open={open ? "true" : "false"} aria-label="Entertainment destinations">
          {ENTERTAINMENT_NAV_GROUPS.map((group) => (
            <div className="entertainment-navigation__group" key={group.label}>
              <h2>{group.label}</h2>
              <div className="entertainment-navigation__links">
                {group.items.map((item) => {
                  const active = isEntertainmentDestinationActive(pathname, item.href);
                  return (
                    <Link href={item.href} key={item.href} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                      <span>{item.label}</span>
                      <small>{item.description}</small>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </section>
  );
}
