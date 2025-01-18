import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        hostname: "nextjs.org",
      },
    ],
  },
};

export default config;
