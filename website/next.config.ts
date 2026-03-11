import type { NextConfig } from "next";
import allowedImageHosts from "./src/lib/allowed-image-hosts.json";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHosts.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
