import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Legacy /personal routes: Home itself is now the entertainment hub
    // (audience-first correction, 2026-07-10; tracked on CRY-255).
    return [
      { source: "/personal/library", destination: "/library", permanent: false },
      { source: "/personal/creative-labs", destination: "/labs", permanent: false },
      { source: "/personal/rooms", destination: "/worlds", permanent: false },
      { source: "/personal/collections", destination: "/creative-works", permanent: false },
      { source: "/personal/:lane", destination: "/releases", permanent: false },
      { source: "/personal", destination: "/", permanent: false },
      { source: "/worlds", destination: "/entertainment", permanent: false },
      { source: "/labs", destination: "/entertainment/visual-studies", permanent: false },
      { source: "/creative-works", destination: "/entertainment", permanent: false },
      { source: "/creative-works/visual-studies", destination: "/entertainment/visual-studies", permanent: false },
      // PROVISIONAL targets — Robert to confirm:
      { source: "/creative-works/singularis", destination: "/products/singularis", permanent: false },
      { source: "/creative-works/holistic-ux", destination: "/professional/articles", permanent: false },
      { source: "/creative-works/crypticdesign-net", destination: "/professional", permanent: false },
      // Safety net for any unmapped legacy slug:
      { source: "/creative-works/:slug*", destination: "/entertainment", permanent: false },
      // CRY-344: legacy Squarespace routes → v18 destinations (matrix §7, approved 2026-07-20).
      { source: "/home", destination: "/", permanent: true },
      { source: "/aboutcrypticdesign", destination: "/professional", permanent: true },
      { source: "/services", destination: "/professional", permanent: true },
      { source: "/singularis", destination: "/products/singularis", permanent: true },
      { source: "/lifa", destination: "/products/lifa", permanent: true },
      { source: "/lifa-progress-reports", destination: "/products/lifa", permanent: true },
      { source: "/lifa-progress-reports/:slug", destination: "/products/lifa", permanent: true },
      { source: "/soundwave", destination: "/products/cryptic-signal", permanent: true },
      { source: "/cryptic-academy", destination: "/professional/articles", permanent: true },
      { source: "/crypticcareers", destination: "/professional/contact", permanent: true },
      { source: "/contact", destination: "/professional/contact", permanent: true },
      // Store preview destination pending (matrix §8.1); temporary until it ships:
      { source: "/store", destination: "/", permanent: false },
      { source: "/cart", destination: "/", permanent: true },
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
