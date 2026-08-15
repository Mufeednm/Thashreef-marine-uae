import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
