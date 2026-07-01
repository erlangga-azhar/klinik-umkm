import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // =====================================================================
  // PRODUCTION BUILD OPTIMIZATION
  // =====================================================================

  // Standalone output untuk Vercel — memastikan semua dependency ter-bundle
  output: "standalone",

  // Matikan source maps di production untuk mempercepat build
  productionBrowserSourceMaps: false,

  // Konfigurasi compiler
  compiler: {
    // Hapus console.log di production (kecuali console.error)
    removeConsole: {
      exclude: ["error"],
    },
  },

  // =====================================================================
  // HEADERS & SECURITY
  // =====================================================================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
