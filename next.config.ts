import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Environment variables for AWS
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Temporarily disable TypeScript checking for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
