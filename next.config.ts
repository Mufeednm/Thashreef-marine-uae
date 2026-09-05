import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // N-Genius sandbox accepts 127.0.0.1 for its local hosted-payment return URL.
  // Allow this alternate local origin to load Next.js development resources as well.
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
  experimental: {
    serverActions: {
      // Product gallery uploads allow three files of up to 5 MB each.
      bodySizeLimit: "16mb",
    },
  },
  images: {
    remotePatterns: [
      {
        hostname: "images.unsplash.com",
        protocol: "https",
      },
    ],
  },
  serverExternalPackages: ["sequelize"],
};

export default nextConfig;
