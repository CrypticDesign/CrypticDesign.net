import { publicReleases, isPubliclyRenderable, type Release } from "./releases.ts";

// Editorial selection, not a popularity ranking or an inference from past dates.
const FEATURED_SLUG = "singularis-themes-vol-1";
const SELECTED_SLUGS = ["singularis-vertical-slice", "singularis-overture", "visual-study-01"];

export function releaseAvailability(release: Release) {
  return release.publication_status === "published" && release.status === "released" ? "Available" : "Coming soon";
}

export function entertainmentSelection(releases: readonly Release[] = publicReleases()) {
  const visible = releases.filter((release) => isPubliclyRenderable(release) && release.visibility_status === "public");
  return {
    featured: visible.find((release) => release.slug === FEATURED_SLUG),
    selected: SELECTED_SLUGS.flatMap((slug) => visible.filter((release) => release.slug === slug)),
  };
}
