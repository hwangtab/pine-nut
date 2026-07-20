"use client";

import Link from "next/link";
import { useConcertStatus } from "@/lib/use-concert-status";

// 홈 히어로의 공연 안내 필: 공연 종료 후 자동 숨김
export default function HomeConcertBanner() {
  const status = useConcertStatus();

  if (!status || status.over) return null;
  const dday = status.label;

  return (
    <Link
      href="/concert"
      className="glass-dark mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-[filter] hover:brightness-125 sm:text-base"
    >
      <span className="rounded-full bg-[var(--color-warm)] px-2.5 py-0.5 text-xs font-black sm:text-sm">
        {dday}
      </span>
      <span className="break-keep">
        8월 1일(토) 청와대 앞 「베어지기 전에 풍천리」 공연 →
      </span>
    </Link>
  );
}
