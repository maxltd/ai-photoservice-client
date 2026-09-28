import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.s3.timeweb.com",
      },
      {
        protocol: "https",
        hostname: "s3.twcstorage.ru",
      },
    ],
  },
};

export default nextConfig;
