import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ojsfile.ohmynews.com" },
      { protocol: "https", hostname: "www.pressian.com" },
      { protocol: "https", hostname: "img1.newsis.com" },
    ],
  },
};

export default nextConfig;
