import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/todo-nextjs',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
