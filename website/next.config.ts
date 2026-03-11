import type { NextConfig } from "next";
import allowedImageHosts from "./src/lib/allowed-image-hosts.json";

let supabaseHostname: string | null = null;
try {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) supabaseHostname = new URL(raw).hostname;
} catch {
  // 잘못된 URL이면 무시 — 빌드 중단 방지
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...allowedImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
      ...(supabaseHostname
        ? [{ protocol: "https" as const, hostname: supabaseHostname }]
        : []),
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
