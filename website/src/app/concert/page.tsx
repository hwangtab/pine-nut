import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import SubHero from "@/components/SubHero";
import { localeAlternates } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";
import { pastConcerts, upcomingConcert, type ConcertEntry } from "@/lib/concert";

export const metadata: Metadata = {
  alternates: localeAlternates("/concert"),
  title: "예술연대 — 풍천리를 지키는 공연들",
  description:
    "숲이 베어지기 전에, 음악가와 예술가들이 풍천리 곁에 섭니다. 마을에서, 거리에서, 청와대 앞에서 이어져온 예술연대를 이 페이지에 기록합니다.",
  openGraph: {
    title: "예술연대 — 풍천리를 지키는 공연들",
    description: "숲이 베어지기 전에, 음악가와 예술가들이 풍천리 곁에 섭니다.",
    images: [
      {
        url: `${SITE_URL}/images/concert/poster-og.jpg`,
        width: 1200,
        height: 630,
        alt: "풍천리 예술연대",
      },
    ],
  },
};

function ConcertCard({ concert }: { concert: ConcertEntry }) {
  return (
    <Link
      href={`/concert/${concert.slug}`}
      className="paper group block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative z-[1] grid gap-6 p-5 sm:grid-cols-[minmax(0,0.62fr)_minmax(0,1fr)] sm:p-6">
        <div className="photo-frame">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
            <Image
              src={concert.posterImage}
              alt={concert.posterAlt}
              fill
              sizes="(max-width: 640px) 100vw, 320px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <span
            className={`self-start rounded-full px-3 py-1 text-xs font-bold ${
              concert.upcoming
                ? "bg-[var(--color-warm)]/15 text-[var(--color-warm)]"
                : "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
            }`}
          >
            {concert.upcoming ? "예정된 공연" : "지난 공연"}
          </span>

          <h3 className="mt-3 text-balance break-keep font-serif-display text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl">
            {concert.title}
          </h3>

          <dl className="mt-4 space-y-1.5 text-sm text-[var(--color-text-muted)]">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
              <dt className="sr-only">일시</dt>
              <dd>
                {concert.dateLabel} · {concert.timeLabel}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
              <dt className="sr-only">장소</dt>
              <dd>{concert.place}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-[var(--color-forest)]" aria-hidden />
              <dt className="sr-only">출연</dt>
              <dd>{concert.lineupCount}팀</dd>
            </div>
          </dl>

          <p className="mt-4 break-keep text-base leading-relaxed text-[var(--color-text-muted)]">
            {concert.summary}
          </p>

          <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-[var(--color-forest)]">
            공연 보기
            <span aria-hidden className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ArtSolidarityPage() {
  const upcoming = upcomingConcert();
  const past = pastConcerts();

  return (
    <div>
      <SubHero
        imageUrl="/images/concert/real-rally.jpg"
        imageAlt="풍천리를 지키기 위해 모인 사람들"
        eyebrow="예술연대"
        title="숲이 베어지기 전에, 노래가 먼저 도착합니다"
        subtitle="음악가와 예술가들이 풍천리 곁에 섭니다. 한 번으로 끝나지 않습니다."
      />

      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          {upcoming ? (
            <>
              <h2 className="font-serif-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                다음 공연
              </h2>
              <div className="mt-6">
                <ConcertCard concert={upcoming} />
              </div>
            </>
          ) : (
            <div className="paper px-6 py-8 text-center">
              <div className="relative z-[1]">
                <p className="break-keep text-lg font-bold text-[var(--color-text)]">
                  다음 공연을 준비하고 있습니다
                </p>
                <p className="mt-2 break-keep text-base leading-relaxed text-[var(--color-text-muted)]">
                  날짜가 정해지면 이곳과 소식 페이지에 가장 먼저 올립니다. 함께 무대에 서고 싶은
                  분, 공연장을 내어주실 분 모두 환영합니다.
                </p>
                <Link
                  href="/board"
                  className="mt-5 inline-flex min-h-[44px] items-center rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
                >
                  함께하고 싶어요
                </Link>
              </div>
            </div>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mt-16 font-serif-display text-2xl font-bold text-[var(--color-text)] sm:text-3xl">
                지난 공연
              </h2>
              {/* 이 목록이 곧 연대의 시작은 아니다. 기록을 남기기 시작한 시점이 여기일 뿐,
                  그 전에도 마을과 거리에서 여러 차례 있었다. */}
              <p className="mt-3 break-keep text-sm leading-relaxed text-[var(--color-text-muted)]">
                이 목록은 사이트에 기록을 남기기 시작한 이후의 공연입니다. 그 전에도 마을과
                거리에서 여러 차례 연대의 자리가 있었습니다.
              </p>
              <div className="mt-6 space-y-8">
                {past.map((concert) => (
                  <ConcertCard key={concert.slug} concert={concert} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
