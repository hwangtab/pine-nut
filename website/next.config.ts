import type { NextConfig } from "next";
import path from "node:path";
import allowedImageHosts from "./src/lib/allowed-image-hosts.json";

let supabaseHostname: string | null = null;
const workspaceRoot = path.resolve(__dirname, "..");
try {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (raw) supabaseHostname = new URL(raw).hostname;
} catch {
  // 잘못된 URL이면 무시 — 빌드 중단 방지
}

const nextConfig: NextConfig = {
  outputFileTracingRoot: workspaceRoot,
  turbopack: {
    root: workspaceRoot,
  },
  images: {
    formats: ["image/avif", "image/webp"],
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
  async headers() {
    return [
      {
        // 셀프호스팅 폰트는 파일명이 고정이므로 1년 불변 캐시
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
