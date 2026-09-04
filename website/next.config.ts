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
      // 회의록 첨부 한도(20MB, src/lib/attachment-limits.ts)보다 커야 한다.
      // 작으면 앱의 용량 검증에 닿기 전에 요청이 잘려 아무 안내 없이 실패한다.
      bodySizeLimit: "24mb",
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
      {
        // public/images는 파일명에 해시가 없어 내용이 바뀌면 같은 이름으로 덮인다.
        // 그래서 immutable은 못 쓰지만, 기본값대로 매번 재검증하게 두면 포스터
        // 원본(1.2MB) 같은 파일이 재방문마다 조건부 요청을 낸다. 하루 캐시 +
        // 한 달 stale-while-revalidate로 재방문을 즉시 응답시킨다.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=2592000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
