import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Allow warnings during builds (only block on errors)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail on TypeScript errors during build
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
