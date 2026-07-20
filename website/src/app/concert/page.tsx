import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Phone, Ticket } from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import { SITE_URL } from "@/lib/site-config";
import {
  CONCERT_DATE_LABEL,
  CONCERT_PHONE,
  CONCERT_PLACE,
  CONCERT_TIME_LABEL,
  CONCERT_TIMETABLE,
  CONCERT_TITLE,
} from "@/lib/concert";
import ConcertHero from "./ConcertHero";

export const metadata: Metadata = {
  title: "베어지기 전에 풍천리 — 8·1 청와대 앞 공연",
  description:
    "2026년 8월 1일(토) 오후 1시–8시, 청와대 앞. 잣나무 11만 그루가 베어지기 전에, 풍천리를 지키려는 음악가 12팀이 모입니다. 강민정·경하와 세민과 멍구와 흑염소·길가는 밴드·김민정(알마즈)·남수·물장구클럽·삼각전파사·아나자오·이서영·자이·종이코트·치핵.",
  openGraph: {
    title: "베어지기 전에 풍천리 — 8·1 청와대 앞 공연",
    description:
      "2026년 8월 1일(토) 오후 1시–8시, 청와대 앞. 풍천리를 지키려는 음악가 12팀의 공연에 함께해주세요.",
    images: [
      {
        url: `${SITE_URL}/images/concert/poster-og.jpg`,
        width: 1200,
        height: 630,
        alt: "베어지기 전에 풍천리 공연 포스터",
      },
    ],
  },
};

const INFO_CARDS = [
  { icon: CalendarDays, label: "일시", value: `${CONCERT_DATE_LABEL} ${CONCERT_TIME_LABEL}` },
  { icon: MapPin, label: "장소", value: CONCERT_PLACE },
  { icon: Ticket, label: "관람", value: "무료 · 누구나" },
  { icon: Phone, label: "문의", value: CONCERT_PHONE, href: `tel:${CONCERT_PHONE}` },
];

export default function ConcertPage() {
  return (
    <div>
      <ConcertHero />

      {/* 공연 안내 */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {INFO_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-6 text-center"
            >
              <card.icon className="mx-auto h-7 w-7 text-[var(--color-forest)]" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-[var(--color-text-muted)]">
                {card.label}
              </p>
              {card.href ? (
                <a
                  href={card.href}
                  className="mt-1 block break-keep text-base font-bold text-[var(--color-text)] hover:text-[var(--color-forest)]"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-1 break-keep text-base font-bold text-[var(--color-text)]">
                  {card.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 타임테이블 */}
      <section className="bg-[var(--color-bg-warm)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Time Table
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            함께하는 음악가 12팀
          </h2>
          <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
            현장 상황에 따라 순서와 시간이 조정될 수 있습니다.
          </p>
          <ol className="mt-10 space-y-2">
            {CONCERT_TIMETABLE.map((slot, i) => (
              <li
                key={slot.name}
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 sm:gap-4 sm:px-5"
              >
                <span className="w-7 shrink-0 text-sm font-black text-[var(--color-warm)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="w-[7.5rem] shrink-0 text-sm font-bold tabular-nums text-[var(--color-text-muted)]">
                  {slot.start} – {slot.end}
                </span>
                <span className="break-keep text-base font-bold leading-snug text-[var(--color-text)]">
                  {slot.name}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] px-4 py-4 sm:gap-4 sm:px-5">
              <span className="w-7 shrink-0" aria-hidden />
              <span className="w-[7.5rem] shrink-0 text-sm font-bold tabular-nums text-[var(--color-text-muted)]">
                19:55 – 20:00
              </span>
              <span className="break-keep text-base font-semibold text-[var(--color-text-muted)]">
                마무리 발언 · 단체사진
              </span>
            </li>
          </ol>
        </div>
      </section>

      {/* 왜 이 공연인가 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            왜 청와대 앞에서 노래할까요
          </h2>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
            <p>
              강원도 홍천 풍천리에는 국내 최대 잣나무 숲(1,800ha)이 있습니다. 양수발전소
              건설이 강행되면 잣나무 약 11만 그루가 베어지고, 51가구가 삶터를 잃습니다.
            </p>
            <p>
              주민들은 7년 넘게, 680회가 넘는 집회로 맞서 왔습니다. 이제 음악가들이
              그 곁에 섭니다. 숲이 베어지기 전에 — 함께 듣고, 함께 외쳐주세요.
            </p>
          </div>
          <Link
            href="/story"
            className="mt-8 inline-flex min-h-[44px] items-center rounded-full border border-[var(--color-forest)] px-6 py-3 text-base font-bold text-[var(--color-forest)] transition-colors hover:bg-[var(--color-forest)]/10"
          >
            풍천리 이야기 자세히 보기 →
          </Link>
        </div>
      </section>

      {/* 오시는 길 */}
      <section className="bg-[var(--color-bg-warm)] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            오시는 길
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[var(--color-text-muted)] sm:text-lg">
            서울 종로구 청와대 앞 (경복궁역 4번 출구에서 도보 약 15분)
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://map.kakao.com/link/search/%EC%B2%AD%EC%99%80%EB%8C%80"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] rounded-full bg-[#FEE500] px-6 py-3 text-base font-bold text-[#191919] transition-opacity hover:opacity-85"
            >
              카카오맵에서 보기
            </a>
            <a
              href="https://map.naver.com/p/search/%EC%B2%AD%EC%99%80%EB%8C%80"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] rounded-full bg-[#03C75A] px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-85"
            >
              네이버지도에서 보기
            </a>
          </div>
        </div>
      </section>

      {/* 포스터 + 공유 */}
      <section id="poster" className="scroll-mt-20 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            포스터를 널리 알려주세요
          </h2>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg">
            <Image
              src="/images/concert/poster.jpg"
              alt="베어지기 전에 풍천리 공연 포스터 — 2026년 8월 1일 토요일 오후 1시부터 8시, 청와대 앞"
              width={1200}
              height={1697}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-auto w-full"
            />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/images/concert/poster.jpg"
              download="베어지기전에-풍천리-포스터.jpg"
              className="min-h-[44px] rounded-full border border-[var(--color-border)] px-6 py-3 text-base font-bold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)]"
            >
              포스터 저장하기
            </a>
          </div>
          <div className="mt-8">
            <ShareButtons
              title={`${CONCERT_TITLE} — 8월 1일(토) 청와대 앞 공연`}
              url={`${SITE_URL}/concert`}
              page="concert"
              section="share"
              contentPrefix="concert.share"
            />
          </div>
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="bg-[var(--color-forest)] px-6 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            공연장에 오지 못해도 함께할 수 있어요
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/petition"
              className="min-h-[48px] rounded-full bg-[var(--color-warm)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-warm-light)]"
            >
              서명하기
            </Link>
            <Link
              href="/board"
              className="min-h-[48px] rounded-full border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              게시판에 응원 남기기
            </Link>
            <Link
              href="/donate"
              className="min-h-[48px] rounded-full border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
