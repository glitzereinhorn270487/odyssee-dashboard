import { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ["@vercel/kv"]
  }
};

export default nextConfig;