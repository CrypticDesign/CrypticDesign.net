export type EcosystemPortalIconName = "worlds" | "arcade" | "media" | "studio" | "play" | "listen" | "discover" | "home" | "crew" | "events" | "discussion" | "menu" | "close";

export default function EcosystemPortalIcon({ name }: { name: EcosystemPortalIconName }) {
  if (name === "menu") return <svg viewBox="0 0 32 32" aria-hidden><path d="M5 8h22M5 16h22M5 24h22"/></svg>;
  if (name === "close") return <svg viewBox="0 0 32 32" aria-hidden><path d="m7 7 18 18M7 25 25 7"/></svg>;
  if (name === "arcade" || name === "play") return <svg viewBox="0 0 32 32" aria-hidden><path d="M9 11h14l5 12-3 3-6-5h-6l-6 5-3-3 5-12Z"/><path d="M10 16h6M13 13v6M22 15v.1M25 18v.1"/></svg>;
  if (name === "media" || name === "listen") return <svg viewBox="0 0 32 32" aria-hidden><path d="M12 24V9l14-3v15M12 13l14-3"/><circle cx="8.5" cy="24.5" r="3.5"/><circle cx="22.5" cy="21.5" r="3.5"/></svg>;
  if (name === "studio" || name === "discover") return <svg viewBox="0 0 32 32" aria-hidden><path d="M5 9h22M5 16h22M5 23h22"/><circle cx="11" cy="9" r="2"/><circle cx="21" cy="16" r="2"/><circle cx="14" cy="23" r="2"/></svg>;
  if (name === "home") return <svg viewBox="0 0 32 32" aria-hidden><path d="M4 15 16 5l12 10v13H4Z"/><path d="M12 28v-8h8v8"/></svg>;
  if (name === "crew") return <svg viewBox="0 0 32 32" aria-hidden><circle cx="12" cy="11" r="4"/><circle cx="23" cy="13" r="3"/><path d="M4 27c1-6 4-9 8-9s7 3 8 9M19 20c4-1 7 2 8 7"/></svg>;
  if (name === "events") return <svg viewBox="0 0 32 32" aria-hidden><rect x="5" y="7" width="22" height="20" rx="1"/><path d="M5 13h22M11 4v6M21 4v6M10 18h4M18 18h4M10 23h4"/></svg>;
  if (name === "discussion") return <svg viewBox="0 0 32 32" aria-hidden><path d="M5 6h22v15H13l-7 6v-6H5Z"/><path d="M10 12h12M10 16h8"/></svg>;
  return <svg viewBox="0 0 32 32" aria-hidden><circle cx="16" cy="16" r="12"/><path d="M4 16h24M16 4c4 4 6 8 6 12s-2 8-6 12c-4-4-6-8-6-12s2-8 6-12z"/></svg>;
}
