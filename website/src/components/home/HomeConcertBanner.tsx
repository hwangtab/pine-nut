"use client";

import Link from "next/link";
import { upcomingConcert } from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";

// 홈 히어로의 공연 안내 필.
// 어느 공연을 가리킬지는 예술연대 레지스트리(CONCERTS)가 정한다 — 배너가 특정
// 공연을 하드코딩하면 다음 공연이 열려도 지난 공연을 계속 가리킨다.
export default function HomeConcertBanner() {
  const concert = upcomingConcert();
  const status = useDday(concert?.startAt ?? new Date());

  if (!concert || !status || status.over) return null;

  return (
    <Link
      href={`/concert/${concert.slug}`}
      className="ink-chip mb-6 max-w-full flex-wrap justify-center transition-[filter] hover:brightness-125"
    >
      <span className="rounded-full bg-[var(--color-forest-light)] px-2.5 py-0.5 text-xs font-black sm:text-sm">
        {status.label}
      </span>
      <span className="break-keep">
        {concert.dateLabel} {concert.place} 「{concert.title}」 →
      </span>
    </Link>
  );
}
