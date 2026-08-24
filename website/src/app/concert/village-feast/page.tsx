import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Car,
  Heart,
  MapPin,
  Megaphone,
  Music,
  Phone,
  Share2,
  Ticket,
  Users,
} from "lucide-react";
import { localeAlternates } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";
import {
  FEAST_ADDRESS,
  FEAST_DATE_LABEL,
  FEAST_LINEUP,
  FEAST_PHONE_COMMITTEE,
  FEAST_PHONE_STAGE,
  FEAST_PLACE,
  FEAST_TIME_LABEL,
  FEAST_TITLE,
} from "@/lib/concert";
import VillageFeastHero from "./VillageFeastHero";

const LINEUP_NAMES = FEAST_LINEUP.map((artist) => artist.name).join("·");

export const metadata: Metadata = {
  alternates: localeAlternates("/concert/village-feast"),
  title: `${FEAST_TITLE} — 9·5 풍천리 마을회관`,
  description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}. 양수발전소에 맞서 7년을 싸워온 마을에서 여는 잔치입니다. ${LINEUP_NAMES} 등 ${FEAST_LINEUP.length}팀이 함께합니다.`,
  openGraph: {
    title: `${FEAST_TITLE} — 9·5 풍천리 마을회관`,
    description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}. 음악가 ${FEAST_LINEUP.length}팀이 마을로 내려옵니다.`,
    images: [
      {
        url: `${SITE_URL}/images/concert/village-feast-og.jpg`,
        width: 1200,
        height: 630,
        alt: `${FEAST_TITLE} 포스터`,
      },
    ],
  },
};

const INFO_CARDS = [
  { icon: CalendarDays, label: "일시", value: FEAST_DATE_LABEL, sub: FEAST_TIME_LABEL },
  { icon: MapPin, label: "장소", value: FEAST_PLACE, sub: "강원 홍천 화촌면" },
  { icon: Ticket, label: "관람", value: "무료", sub: "예매 없이 누구나" },
  {
    icon: Phone,
    label: "문의",
    value: FEAST_PHONE_COMMITTEE,
    sub: "대책위 이창후 총무",
    href: `tel:${FEAST_PHONE_COMMITTEE}`,
  },
];

const PARTICIPATE = [
  {
    icon: Share2,
    title: "오기 전, 알려주세요",
    body: "포스터와 이 페이지를 SNS·단체방에 공유해주세요. 마을에 차 한 대가 더 들어오는 것이 주민들에게는 큰 힘입니다.",
  },
  {
    icon: Users,
    title: "마을에서, 함께 놀아요",
    body: "잔치는 구경하는 자리가 아니라 섞이는 자리입니다. 노래를 듣고, 밥을 나누고, 주민들과 이야기를 나눠주세요.",
  },
  {
    icon: Heart,
    title: "못 오셔도, 연대해요",
    body: "서명·후원·게시판 응원으로도 함께할 수 있습니다. 멀리 있어도 마음은 잣나무 숲에 닿습니다.",
  },
];

const FAQ = [
  {
    q: "관람료가 있나요?",
    a: "무료입니다. 예매나 사전 신청 없이 누구나 오실 수 있어요.",
  },
  {
    q: "몇 시에 끝나나요?",
    a: "오후 1시에 시작합니다. 끝나는 시간과 공연 순서는 준비 상황에 따라 정해지며, 확정되면 이 페이지로 안내드립니다.",
  },
  {
    q: "어떻게 가나요?",
    a: "풍천리는 대중교통이 드문 산촌 마을입니다. 자가용을 권하고, 함께 오실 분들끼리 차를 나눠 타시면 좋습니다. 이동이 어려우시면 대책위로 미리 연락 주세요.",
  },
  {
    q: "무엇을 준비하면 좋나요?",
    a: "야외 자리가 많습니다. 앉을 자리(돗자리)와 모자, 초가을 저녁에 대비한 겉옷을 챙기시면 편합니다.",
  },
];

export default function VillageFeastPage() {
  return (
    <div>
      <VillageFeastHero />

      {/* 잔치 안내 */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {INFO_CARDS.map((card) => (
            <div key={card.label} className="paper px-4 py-6 text-center">
              <div className="relative z-[1]">
                <card.icon className="mx-auto h-7 w-7 text-[var(--color-forest)]" aria-hidden />
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {card.label}
                </p>
                {card.href ? (
                  <a
                    href={card.href}
                    className="mt-1 block break-keep text-lg font-bold text-[var(--color-text)] hover:text-[var(--color-forest)]"
                  >
                    {card.value}
                  </a>
                ) : (
                  <p className="mt-1 break-keep text-lg font-bold text-[var(--color-text)]">
                    {card.value}
                  </p>
                )}
                <p className="mt-0.5 break-keep text-xs text-[var(--color-text-muted)]">
                  {card.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 왜 잔치인가 */}
      <section className="px-6 pb-4 pt-4 sm:pb-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Why a Feast
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl">
            싸우는 마을에도 잔칫날이 있어야 합니다
          </h2>

          <p className="mt-8 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            <b className="font-bold">7년입니다.</b> 풍천리 사람들이 양수발전소에 반대하며 거리에 선
            시간이. 705번이 넘는 집회를 예순에서 여든의 손들이 지켜왔고, 그중 일곱 분은 지금
            재판을 받고 있습니다. 싸움이 길어질수록 마을에서 사라지는 건 나무만이 아닙니다.
            웃음이 먼저 사라집니다.
          </p>

          <div className="mt-12 rounded-[var(--radius-panel)] border-l-4 border-[var(--color-forest)] bg-[var(--color-bg-warm)] px-6 py-8 sm:px-10">
            <p className="break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
              지난해 여름에도 같은 마을회관에서 잔치가 열렸습니다. 음악가와 예술가 열다섯 팀이
              모였고, 토종 씨앗을 나누고 건강 상담을 하고 다 같이 춤을 췄습니다. 그날 한 주민은
              이렇게 말했습니다.
            </p>
            <p className="font-hand mt-6 break-keep text-2xl leading-relaxed text-[var(--color-forest)] sm:text-3xl">
              “사람답게 산 것 같다. 몇 년 만에 웃어봤는지 모르겠다.”
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">
              — 2025년 7월 「잣나무골 여름잔치」에서, 주민 허순 님
            </p>
          </div>

          <p className="mt-12 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            그래서 다시 모입니다. 8월 1일 청와대 앞에서 열린 첫 예술연대가 마을의 목소리를 서울로
            올려보낸 자리였다면, 이번 <b className="font-bold">9월 5일</b>은 반대로 음악가들이
            마을로 내려오는 자리입니다. 구호가 아니라 노래로, 집회가 아니라 잔치로 하루를
            채웁니다.
          </p>

          <p className="mt-8 break-keep text-xl font-bold text-[var(--color-forest)] sm:text-2xl">
            숲을 지키는 일에는 이런 하루도 필요합니다.
          </p>
        </div>
      </section>

      {/* 라인업 */}
      <section id="lineup" className="scroll-mt-20 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Line-up
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            함께하는 음악가 {FEAST_LINEUP.length}팀
          </h2>
          <p className="mt-3 break-keep text-sm text-[var(--color-text-muted)]">
            포스터에 실린 순서입니다. 공연 순서와 시간은 현장에서 안내합니다.
          </p>

          <ul className="mt-10 space-y-2">
            {FEAST_LINEUP.map((artist, i) => (
              <li key={artist.name} className="paper">
                <div className="relative z-[1] flex gap-4 px-5 py-5">
                  <span className="mt-0.5 w-7 shrink-0 text-sm font-bold text-[var(--color-forest)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="break-keep text-lg font-bold leading-snug text-[var(--color-text)]">
                      {artist.name}
                    </h3>
                    {artist.blurb ? (
                      <p className="mt-1.5 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                        {artist.blurb}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 이렇게 함께해주세요 */}
      <section className="bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Join Us
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            이렇게 함께해주세요
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PARTICIPATE.map((p) => (
              <div key={p.title} className="paper p-6">
                <div className="relative z-[1]">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)]">
                    <p.icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-[var(--color-text)]">{p.title}</h3>
                  <p className="mt-2 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 오시는 길 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Location
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            오시는 길
          </h2>
          <p className="mt-4 text-balance break-keep text-lg font-bold text-[var(--color-text)]">
            {FEAST_PLACE} · {FEAST_ADDRESS}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="paper p-6">
              <div className="relative z-[1]">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-forest)]">
                  <Car className="h-5 w-5" aria-hidden />
                  자가용
                </span>
                <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  가리산 자락 해발 400~700m의 산촌 마을입니다. 내비게이션에{" "}
                  <b className="text-[var(--color-text)]">‘풍천리 마을회관’</b>을 검색해 오세요.
                  함께 오실 분들끼리 차를 나눠 타시면 좋습니다.
                </p>
              </div>
            </div>
            <div className="paper p-6">
              <div className="relative z-[1]">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-forest)]">
                  <Music className="h-5 w-5" aria-hidden />
                  초가을 야외 잔치
                </span>
                <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  돗자리와 모자, 해가 진 뒤를 위한 겉옷을 챙겨오시면 오래 편하게 함께할 수 있어요.
                  이동이 어려우시면 대책위로 미리 연락 주세요.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <a
              href="https://map.kakao.com/link/search/%ED%99%8D%EC%B2%9C%20%ED%99%94%EC%B4%8C%EB%A9%B4%20%ED%92%8D%EC%B2%9C%EB%A6%AC%20%EB%A7%88%EC%9D%84%ED%9A%8C%EA%B4%80"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FEE500] px-6 py-3 text-base font-bold text-[#191919] transition-opacity hover:opacity-85"
            >
              카카오맵에서 보기
            </a>
            <a
              href="https://map.naver.com/p/search/%ED%99%8D%EC%B2%9C%20%ED%99%94%EC%B4%8C%EB%A9%B4%20%ED%92%8D%EC%B2%9C%EB%A6%AC%20%EB%A7%88%EC%9D%84%ED%9A%8C%EA%B4%80"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#03C75A] px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-85"
            >
              네이버지도에서 보기
            </a>
          </div>
        </div>
      </section>

      {/* 포스터 */}
      <section id="poster" className="scroll-mt-20 bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Spread the Word
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            포스터를 널리 알려주세요
          </h2>
          <p className="mt-3 break-keep text-base text-[var(--color-text-muted)]">
            내려받아 SNS·단체방·동네 게시판에 공유해주세요.
          </p>
          <div className="photo-frame mt-8">
            <Image
              src="/images/concert/village-feast-poster.jpg"
              alt={`${FEAST_TITLE} 포스터 — 2026년 9월 5일 토요일 오후 1시. 출연: ${LINEUP_NAMES}`}
              width={1587}
              height={2245}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-auto w-full rounded-[2px]"
            />
          </div>
          <div className="mt-6">
            <a
              href="/images/concert/village-feast-poster.jpg"
              download="풍천리-좋은-마을-잔치-포스터.jpg"
              className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--color-forest)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
            >
              포스터 저장하기
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            FAQ
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            자주 묻는 질문
          </h2>
          <dl className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <div key={item.q} className="paper p-6">
                <div className="relative z-[1]">
                  <dt className="text-lg font-bold text-[var(--color-text)]">Q. {item.q}</dt>
                  <dd className="mt-2 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                    {item.a}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 break-keep text-center text-sm text-[var(--color-text-muted)]">
            잔치 문의{" "}
            <a
              href={`tel:${FEAST_PHONE_COMMITTEE}`}
              className="font-bold text-[var(--color-forest)] hover:underline"
            >
              {FEAST_PHONE_COMMITTEE}
            </a>{" "}
            (대책위 이창후 총무) · 공연 문의{" "}
            <a
              href={`tel:${FEAST_PHONE_STAGE}`}
              className="font-bold text-[var(--color-forest)] hover:underline"
            >
              {FEAST_PHONE_STAGE}
            </a>
          </p>
        </div>
      </section>

      {/* 마무리 CTA — 푸터와 같은 색이면 경계가 사라지므로 한 단 밝은 어둠을 쓴다 */}
      <section className="relative overflow-hidden bg-[var(--color-deep-raised)] px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <Megaphone className="mx-auto h-10 w-10 text-[var(--color-earth-light)]" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-[16ch] text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            마을에 오지 못해도 함께할 수 있어요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance break-keep text-base text-white/80 sm:text-lg">
            서명 한 번, 응원 한 줄, 후원 한 걸음이 풍천리의 숲을 지키는 힘이 됩니다.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/petition" className="letter-btn letter-btn--primary">
              서명하기
            </Link>
            <Link href="/board" className="letter-btn letter-btn--outline">
              게시판에 응원 남기기
            </Link>
            <Link href="/donate" className="letter-btn letter-btn--outline">
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
