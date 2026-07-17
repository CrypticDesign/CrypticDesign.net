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
    ];
  },
};

export default nextConfig;
