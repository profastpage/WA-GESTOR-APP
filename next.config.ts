import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  // Tell the bundler to NOT try to bundle these packages
  // They will be available at runtime on Cloudflare Workers
  serverExternalPackages: [
    '@prisma/adapter-libsql',
    '@libsql/client',
  ],
};

export default nextConfig;
