import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the live Turbopack preview isolated from `next build`; sharing
  // `.next` lets a production build delete development manifests mid-session.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  async redirects() {
    // Legacy /personal routes: Home itself is now the entertainment hub
    // (audience-first correction, 2026-07-10; tracked on CRY-255).
    return [
      { source: "/personal/library", destination: "/library", permanent: false },
      { source: "/personal/creative-labs", destination: "/entertainment", permanent: true },
      { source: "/personal/rooms", destination: "/entertainment", permanent: false },
      { source: "/personal/collections", destination: "/entertainment", permanent: false },
      { source: "/personal/:lane", destination: "/releases", permanent: false },
      { source: "/personal", destination: "/", permanent: false },
      { source: "/worlds", destination: "/entertainment", permanent: true },
      { source: "/labs", destination: "/entertainment", permanent: true },
      // CRY-266: Creative Works is permanently retired. Sitemap v20 does not
      // retain Visual Studies as a canonical destination, so that legacy slug
      // resolves to the Entertainment front door instead of preserving a v18
      // detail-page assumption.
      { source: "/creative-works", destination: "/entertainment", permanent: true },
      { source: "/creative-works/visual-studies", destination: "/entertainment", permanent: true },
      { source: "/creative-works/singularis", destination: "/products/singularis", permanent: true },
      { source: "/creative-works/holistic-ux", destination: "/professional/articles", permanent: true },
      { source: "/creative-works/crypticdesign-net", destination: "/professional", permanent: true },
      // Preserve unknown inbound links without recreating the retired hierarchy.
      { source: "/creative-works/:slug*", destination: "/entertainment", permanent: true },
      // Wave 0: preserve the Arcade/playable catalog's existing compatibility URL.
      // General Entertainment discovery is canonical at /entertainment.
      { source: "/entertainment/arcade", destination: "/entertainment/explore", permanent: true },
      // Singularis has one continuous playable destination. Preserve the old
      // release URL as an inbound link without keeping a duplicate page.
      {
        source: "/releases/singularis-vertical-slice",
        destination: "/products/singularis",
        permanent: true,
      },
      // CRY-344: legacy Squarespace routes → v18 destinations (matrix §7, approved 2026-07-20).
      { source: "/home", destination: "/", permanent: true },
      { source: "/aboutcrypticdesign", destination: "/professional", permanent: true },
      { source: "/services", destination: "/professional", permanent: true },
      { source: "/singularis", destination: "/products/singularis", permanent: true },
      { source: "/lifa", destination: "/products/lifa", permanent: true },
      { source: "/lifa-demo", destination: "/products/lifa", permanent: true },
      { source: "/lifa-progress-reports", destination: "/products/lifa", permanent: true },
      { source: "/lifa-progress-reports/:slug", destination: "/products/lifa", permanent: true },
      { source: "/soundwave", destination: "/products/cryptic-signal", permanent: true },
      { source: "/cryptic-academy", destination: "/professional/articles", permanent: true },
      { source: "/crypticcareers", destination: "/professional/inquiry", permanent: true },
      { source: "/contact", destination: "/professional/inquiry", permanent: true },
      { source: "/professional/contact", destination: "/professional/inquiry", permanent: true },
      { source: "/store", destination: "/entertainment/store", permanent: true },
      { source: "/store/:path*", destination: "/entertainment/store", permanent: true },
      { source: "/cart", destination: "/entertainment/store", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/portfolio", destination: "/professional", permanent: true },
      { source: "/portfolio/signal-systems", destination: "/audio", permanent: true },
      { source: "/portfolio/humankind", destination: "/professional/case-studies", permanent: true },
      { source: "/portfolio/robert-croft", destination: "/professional", permanent: true },
      { source: "/articles", destination: "/professional/articles", permanent: true },
      { source: "/articles/category/:path*", destination: "/professional/articles", permanent: true },
      { source: "/articles/tag/:path*", destination: "/professional/articles", permanent: true },
      // Legacy post that 404s on the live site (stale sitemap entry) — send to the index.
      {
        source: "/articles/player-psychology-game-design",
        destination: "/professional/articles",
        permanent: true,
      },
      { source: "/articles/:slug", destination: "/professional/articles/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
