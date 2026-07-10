/**
 * Library placeholder behavior (Sprint 1). Saved releases live in
 * localStorage until the account/character foundation (CRY-244) and real
 * library service (CRY-258) exist. Client-side only.
 */

const STORAGE_KEY = "crypticdesign.library.v1";

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

/** Toggles a slug; returns the new saved state. */
export function toggleSaved(slug: string): boolean {
  const current = getSavedSlugs();
  const exists = current.includes(slug);
  const next = exists
    ? current.filter((item) => item !== slug)
    : [...current, slug];
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — silently degrade.
  }
  return !exists;
}
