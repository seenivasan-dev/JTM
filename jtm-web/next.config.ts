import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

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

export default withSerwist(nextConfig);
