import Image from "next/image";
import Link from "next/link";
import { CONCERTS } from "@/lib/concert";

// 지난 공연 페이지 끝에서 그 뒤에 이어진 공연으로 넘겨주는 카드.
//
// 배지·날짜·장소는 레지스트리(CONCERTS)에서 읽는다. 카드에 "예정된 공연"과 날짜를
// 직접 적어두면 그 공연이 끝난 뒤에도 예정 공연으로 계속 안내한다 — 목자르기가
// 끝나고 마을 잔치·before-cut 페이지에서 실제로 그랬다.
export default function FollowingConcertCard({ slug }: { slug: string }) {
  const concert = CONCERTS.find((entry) => entry.slug === slug);
  if (!concert) throw new Error(`FollowingConcertCard: unknown concert slug "${slug}"`);

  return (
    <Link
      href={`/concert/${concert.slug}`}
      className="paper group mt-8 block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative z-[1] grid gap-6 p-5 sm:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] sm:p-6">
        <div className="photo-frame">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
            <Image
              src={concert.posterImage}
              alt={`${concert.title} 포스터`}
              fill
              sizes="(max-width: 640px) 100vw, 260px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <span className="self-start rounded-full bg-[var(--color-warm)]/15 px-3 py-1 text-xs font-bold text-[var(--color-warm)]">
            {concert.upcoming ? "예정된 공연" : "지난 공연"}
          </span>
          <h3 className="mt-3 break-keep font-serif-display text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl">
            {concert.title}
          </h3>
          <p className="mt-3 break-keep text-base leading-relaxed text-[var(--color-text-muted)]">
            {concert.dateLabel} · {concert.place}
          </p>
          <p className="mt-2 break-keep text-base leading-relaxed text-[var(--color-text-muted)]">
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
