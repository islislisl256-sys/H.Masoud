import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Use Babel loader instead of SWC to avoid Windows binary issue
  webpack: (config, { defaultLoaders }) => {
    // Replace next-swc-loader with babel-loader
    config.module.rules.forEach((rule: any) => {
      if (Array.isArray(rule.use)) {
        rule.use = rule.use.map((u: any) => {
          if (typeof u === 'object' && u.loader && u.loader.includes('next-swc-loader')) {
            return { loader: 'babel-loader', options: { presets: ['next/babel'] } };
          }
          return u;
        });
      }
    });
    return config;
  },
  // Silence workspace-root warning
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
