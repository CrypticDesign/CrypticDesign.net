export const CANONICAL_SITE_ORIGIN = "https://crypticdesign.net";

/**
 * Resolve an application path through the public canonical origin.
 *
 * Absolute inputs are reduced to their path/query/hash so an internal runtime
 * hostname can never leak into an external redirect Location header.
 */
export function canonicalSiteUrl(path: string | URL): URL {
  const candidate = new URL(path.toString(), CANONICAL_SITE_ORIGIN);
  return new URL(`${candidate.pathname}${candidate.search}${candidate.hash}`, CANONICAL_SITE_ORIGIN);
}
