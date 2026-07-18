import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    // Legacy /personal routes resolve into the Sitemap v18 front doors.
    return [
      { source: "/personal/library", destination: "/library", permanent: false },
      { source: "/personal/creative-labs", destination: "/entertainment/visual-studies", permanent: false },
      { source: "/personal/rooms", destination: "/entertainment", permanent: false },
      { source: "/personal/collections", destination: "/entertainment", permanent: false },
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
