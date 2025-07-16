import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@t3-oss/env-nextjs"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "3v2ggoltqx.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
};

export default nextConfig;
