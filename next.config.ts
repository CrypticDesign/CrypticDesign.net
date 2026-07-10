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
    ];
  },
};

export default nextConfig;
