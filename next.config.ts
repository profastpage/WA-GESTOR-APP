import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "standalone" output - @cloudflare/next-on-pages handles the build
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow images from external sources
  images: {
    unoptimized: true, // Required for Cloudflare Pages
  },
};

export default nextConfig;
