import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Only fail on errors, not warnings
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail on TypeScript errors during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
