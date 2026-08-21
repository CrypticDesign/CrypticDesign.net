"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MEMBERSHIP_SESSION_CHANGED_EVENT } from "@/lib/membership-session-events";

const ACCOUNT_NAV_ITEMS = [
  { href: "/account", label: "Overview", description: "Identity & character", icon: "overview" },
  { href: "/account/security", label: "Security", description: "Sign-in & recovery", icon: "security" },
  { href: "/library", label: "My Library", description: "Saved releases", icon: "library" },
  { href: "/account/subscription", label: "Access", description: "Account & subscription", icon: "access" },
  { href: "/account/settings", label: "Settings", description: "Privacy & controls", icon: "settings" },
] as const;

function Icon({ name }: { name: (typeof ACCOUNT_NAV_ITEMS)[number]["icon"] }) {
  if (name === "security") return <svg viewBox="0 0 32 32" aria-hidden><path d="M16 3l10 4v7c0 7-4.4 12-10 15-5.6-3-10-8-10-15V7z"/><path d="M12 15h8v7h-8zM14 15v-2a2 2 0 0 1 4 0v2"/></svg>;
  if (name === "library") return <svg viewBox="0 0 32 32" aria-hidden><path d="M5 6h7v21H5zM13 6h6v21h-6zM21 5l6 1-2 21-6-1z"/><path d="M7 10h3M15 10h2M22 10l3 .3"/></svg>;
  if (name === "access") return <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="12"/><path d="M4 16h24M16 4c4 4 6 8 6 12s-2 8-6 12c-4-4-6-8-6-12s2-8 6-12z"/></svg>;
  if (name === "settings") return <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="4"/><path d="M16 3v5M16 24v5M3 16h5M24 16h5M7 7l4 4M21 21l4 4M25 7l-4 4M11 21l-4 4"/></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="11" r="5"/><path d="M6 28c1-7 5-10 10-10s9 3 10 10"/></svg>;
}

function isActive(pathname: string, href: string) {
  if (href === "/account") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AccountNavigation({ initialAuthenticated = false }: { initialAuthenticated?: boolean }) {
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const relevant = pathname === "/account" || pathname.startsWith("/account/") || pathname === "/library";

  useEffect(() => {
    let active = true;
    async function syncSession() {
      try {
        const response = await fetch("/api/membership/session", { cache: "no-store" });
        if (!response.ok) return;
        const payload = await response.json();
        if (active) setAuthenticated(Boolean(payload.authenticated));
      } catch {
        // Preserve the server-rendered state when account services are unavailable.
      }
    }
    function handleSessionChange(event: Event) {
      const detail = (event as CustomEvent<{ authenticated?: boolean }>).detail;
      if (typeof detail?.authenticated === "boolean") {
        setAuthenticated(detail.authenticated);
        return;
      }
      void syncSession();
    }
    void syncSession();
    window.addEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      active = false;
      window.removeEventListener(MEMBERSHIP_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, [pathname]);

  if (!relevant || !authenticated) return null;

  return (
    <section className="entertainment-navigation account-section-navigation" data-section-theme="blue" aria-label="Explore Account">
      <div className="shell entertainment-navigation__viewport">
        <nav className="entertainment-navigation__bar account-section-navigation__bar" aria-label="Account sections">
          {ACCOUNT_NAV_ITEMS.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className="entertainment-navigation__item"
              data-theme="blue"
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
            >
              <span className="entertainment-navigation__icon"><Icon name={item.icon} /></span>
              <span className="entertainment-navigation__copy"><strong>{item.label}</strong><small>{item.description}</small></span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
