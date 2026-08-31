"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { upcomingConcert } from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";

// 서명을 마친(또는 명단을 훑어보는) 사람에게 "다음에 만날 자리"를 건네는 카드.
//
// 어느 공연을 가리킬지는 예술연대 레지스트리(CONCERTS)가 정한다 — 홈 배너
// (HomeConcertBanner)와 같은 원칙이다. 여기서 특정 공연을 하드코딩하면 잔치가
// 끝난 뒤에도 지난 잔치를 계속 홍보하게 된다.
//
// 예정된 공연이 없거나 이미 지났으면 아무것도 렌더하지 않는다. 빈 껍데기를
// 남기지 않으므로 부모의 space-y 간격도 함께 사라진다.
export default function UpcomingConcertCard() {
  const concert = upcomingConcert();
  const status = useDday(concert?.startAt ?? new Date());

  if (!concert || !status || status.over) return null;

  return (
    <section aria-label={`예정된 공연 — ${concert.title}`}>
      <Link
        href={`/concert/${concert.slug}`}
        className="paper group block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
      >
        <div className="relative z-[1] flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          {/* 포스터. 모바일에서는 카드 폭을 다 쓰지 않고 가운데 좁게 세워 둔다 —
              세로 3:4 포스터가 전체 폭을 차지하면 카드가 화면 하나를 통째로
              먹어 명단 아래 흐름이 끊긴다. */}
          <div className="photo-frame mx-auto w-32 shrink-0 sm:mx-0 sm:w-40">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
              <Image
                src={concert.posterImage}
                alt={concert.posterAlt}
                fill
                sizes="(max-width: 640px) 128px, 160px"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="rounded-full bg-[var(--color-warm)] px-2.5 py-0.5 text-xs font-black text-white">
                {status.label}
              </span>
              <span className="rounded-full bg-[var(--color-warm)]/15 px-3 py-1 text-xs font-bold text-[var(--color-warm)]">
                예정된 공연
              </span>
            </div>

            <h2 className="mt-3 text-balance break-keep font-serif-display text-2xl font-bold leading-tight text-[var(--color-text)]">
              {concert.title}
            </h2>

            {/* 노년 독자가 주 사용자라 본문은 15px 아래로 내리지 않는다.
                (서명 폼의 text-[15px]·min-h-[48px] 기준과 같은 이유) */}
            <dl className="mt-3 space-y-1.5 text-[15px] text-[var(--color-text-muted)]">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <CalendarDays className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
                <dt className="sr-only">일시</dt>
                <dd className="break-keep">
                  {concert.dateLabel} · {concert.timeLabel}
                </dd>
              </div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <MapPin className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
                <dt className="sr-only">장소</dt>
                <dd className="min-w-0 break-keep">{concert.place}</dd>
              </div>
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <Users className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
                <dt className="sr-only">출연</dt>
                <dd>{concert.lineupCount}팀</dd>
              </div>
            </dl>

            <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
              {concert.summary}
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-[15px] font-bold text-[var(--color-forest)]">
              잔치 보러 가기
              <span aria-hidden className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
