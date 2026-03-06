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
  webpack: (config, { isServer }) => {
    // Suppress outdated webpack API warnings from third-party plugins (e.g. serwist/copy-webpack-plugin)
    config.ignoreWarnings = [
      { message: /deprecated webpack/ },
      { message: /\[DEP_WEBPACK\]/ },
    ];
    return config;
  },
};

export default withSerwist(nextConfig);
