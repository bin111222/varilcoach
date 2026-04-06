import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
