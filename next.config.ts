import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "export",
  images: {
    unoptimized: true,
  },

  async headers() {
    return [
      {
        source: "/(.*).mobileconfig",
        headers: [
          {
            key: "Content-Type",
            value: "application/x-apple-aspen-config",
          },
        ],
      },
    ];
  },

};

export default nextConfig;
