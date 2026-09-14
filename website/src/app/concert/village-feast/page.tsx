import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Megaphone,
  Ticket,
  Users,
} from "lucide-react";
import { OG_SITE, localeAlternates } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";
import {
  FEAST_DATE_LABEL,
  FEAST_LINEUP,
  FEAST_TIMETABLE,
  FEAST_PLACE,
  FEAST_START,
  FEAST_TIME_LABEL,
  FEAST_TITLE,
} from "@/lib/concert";
import { PineConeIcon } from "@/components/visuals/ForestLetterMotifs";
import ShareButtons from "@/components/ShareButtons";
import VillageFeastHero from "./VillageFeastHero";

const FEAST_URL = `${SITE_URL}/concert/village-feast`;

// 끝난 공연의 기록. 날짜가 지났어도 구조화 데이터는 남긴다 — 검색에서 "그때
// 무슨 공연이 있었나"로 찾아오는 경로이고, 지운다고 색인이 깨끗해지지 않는다.
// 종료 시각은 그날 단체사진을 찍고 마친 17시로 확정됐으므로 이제 endDate 를 적는다.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "MusicEvent",
  name: FEAST_TITLE,
  startDate: FEAST_START.toISOString(),
  endDate: new Date("2026-09-05T17:00:00+09:00").toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: FEAST_URL,
  image: [
    `${SITE_URL}/images/concert/village-feast-og.jpg`,
    `${SITE_URL}/images/concert/village-feast-poster.jpg`,
  ],
  description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}에서 열린 마을 잔치. 홍천 양수발전소 건설에 8년째 반대해온 풍천리에서 음악가 ${FEAST_LINEUP.length}팀이 함께했습니다. 관람료는 없었습니다.`,
  isAccessibleForFree: true,
  inLanguage: "ko",
  location: {
    "@type": "Place",
    name: FEAST_PLACE,
    address: {
      "@type": "PostalAddress",
      streetAddress: "화촌면 풍천리",
      addressLocality: "홍천군",
      addressRegion: "강원특별자치도",
      addressCountry: "KR",
    },
  },
  performer: FEAST_LINEUP.map((artist) => ({
    "@type": "MusicGroup",
    name: artist.name,
  })),
  organizer: {
    "@type": "Organization",
    name: "홍천양수발전소 반대대책위원회",
    url: SITE_URL,
  },
};

const LINEUP_NAMES = FEAST_LINEUP.map((artist) => artist.name).join("·");

// 목록은 포스터 순서가 아니라 무대에 서는 순서로 보여준다 — 관객이 이 페이지에서
// 가장 알고 싶은 것은 "누가 언제 나오나"이기 때문이다. 이름이 어긋나면 팀이
// 조용히 목록에서 빠지므로, 짝을 못 찾은 칸은 빌드 때 바로 터뜨린다.
const TIMETABLE_ROWS = FEAST_TIMETABLE.map((slot) => {
  const artist = FEAST_LINEUP.find((a) => a.name === slot.name);
  if (!artist) {
    throw new Error(`FEAST_TIMETABLE 의 "${slot.name}" 가 FEAST_LINEUP 에 없습니다.`);
  }
  return { slot, artist };
});

// 사진 출처는 페이지에 밝힌다 — 우리가 찍은 사진이 아니다.
const PHOTO_CREDITS = [
  ...new Set(FEAST_LINEUP.map((artist) => artist.photoCredit).filter(Boolean)),
].join(" · ");
const HAS_MISSING_PHOTO = FEAST_LINEUP.some((artist) => !artist.photo);

export const metadata: Metadata = {
  alternates: localeAlternates("/concert/village-feast"),
  title: `${FEAST_TITLE} — 9·5 홍천 마을회관`,
  description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}. 양수발전소에 맞서 8년째 싸워온 마을에서 음악가 ${FEAST_LINEUP.length}팀이 연 잔치입니다.`,
  openGraph: {
    ...OG_SITE,
    title: `${FEAST_TITLE} — 9·5 홍천 마을회관`,
    description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}. 음악가 ${FEAST_LINEUP.length}팀이 마을로 내려온 날.`,
    images: [
      {
        url: `${SITE_URL}/images/concert/village-feast-og.jpg`,
        width: 1200,
        height: 630,
        alt: `${FEAST_TITLE} — ${FEAST_DATE_LABEL} ${FEAST_PLACE}`,
      },
    ],
  },
  // twitter:card 이 없으면 X 는 og:image 를 작은 정사각 썸네일로 줄여 붙인다.
  // 1.91:1 카드를 만들어둔 이상 큰 가로 카드로 뜨게 명시한다.
  twitter: {
    card: "summary_large_image",
    title: `${FEAST_TITLE} — 9·5 홍천 마을회관`,
    description: `${FEAST_DATE_LABEL} ${FEAST_TIME_LABEL}, ${FEAST_PLACE}. 음악가 ${FEAST_LINEUP.length}팀이 마을로 내려온 날.`,
    images: [`${SITE_URL}/images/concert/village-feast-og.jpg`],
  },
};

const INFO_CARDS = [
  { icon: CalendarDays, label: "일시", value: FEAST_DATE_LABEL, sub: FEAST_TIME_LABEL },
  { icon: MapPin, label: "장소", value: FEAST_PLACE, sub: "강원 홍천 화촌면" },
  { icon: Ticket, label: "관람", value: "무료", sub: "예매 없이 누구나" },
  { icon: Users, label: "출연", value: `${FEAST_LINEUP.length}팀`, sub: "오후 2시 – 5시" },
];

export default function VillageFeastPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />

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
                <p className="mt-1 break-keep text-lg font-bold text-[var(--color-text)]">
                  {card.value}
                </p>
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
            <b className="font-bold">8년째입니다.</b> 풍천리 사람들이 양수발전소에 반대하며 거리에 선
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
              — 2025년 7월 「잣나무골 여름잔치」에서, 허순이 주민
            </p>
          </div>

          <p className="mt-12 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            그래서 다시 모였습니다. 음악가들이 풍천리 곁에 선 것은 처음이 아닙니다. 마을에서,
            거리에서, 서울에서 여러 차례 이어져왔습니다. 8월 1일 청와대 앞 공연이 마을의
            목소리를 서울로 올려보낸 자리였다면, <b className="font-bold">9월 5일</b>은
            반대로 음악가들이 마을로 내려온 자리였습니다.
          </p>

          <p className="mt-8 break-keep text-xl font-bold text-[var(--color-forest)] sm:text-2xl">
            숲을 지키는 일에는 이런 하루도 필요했습니다.
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
            함께한 음악가 {FEAST_LINEUP.length}팀
          </h2>
          <p className="mt-3 break-keep text-sm text-[var(--color-text-muted)]">
            오후 1시에 열어 밥 먹고 춤추고 이야기하다가, 2시부터 무대가 이어졌습니다.
            한 팀이 15분씩 노래하고 5분씩 무대를 바꿨습니다. 아래는 그날 예정했던
            순서입니다.
          </p>

          <ul className="mt-10 space-y-2">
            <li className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-5 py-5">
              <p className="text-sm font-bold tabular-nums text-[var(--color-text-muted)]">
                13:00 – 14:00
              </p>
              <p className="mt-0.5 break-keep text-base font-semibold text-[var(--color-text-muted)]">
                식사 · 댄스 · 수다
              </p>
            </li>
            {TIMETABLE_ROWS.map(({ slot, artist }) => (
              <li key={slot.name} className="paper">
                <div className="relative z-[1] flex items-start gap-4 px-5 py-5">

                  {/* 사진이 없는 팀도 같은 자리를 차지해야 이름 줄이 어긋나지 않는다 */}
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full sm:h-20 sm:w-20">
                    {artist.photo ? (
                      <Image
                        src={artist.photo}
                        alt={`${artist.name} 프로필 사진`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center bg-[var(--color-bg-warm)] text-[var(--color-forest)]/45"
                        aria-hidden
                      >
                        <PineConeIcon className="h-8 w-8" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    {/* 시각을 왼쪽 칸으로 세우면 사진과 함께 좁은 화면에서 이름을
                        밀어낸다. 이름 위 한 줄로 얹으면 폭을 먹지 않는다. */}
                    <p className="text-sm font-bold tabular-nums text-[var(--color-forest)]">
                      {slot.start} – {slot.end}
                    </p>
                    <h3 className="mt-0.5 break-keep text-lg font-bold leading-snug text-[var(--color-text)]">
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
            <li className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-5 py-5">
              <p className="text-sm font-bold tabular-nums text-[var(--color-text-muted)]">17:00</p>
              <p className="mt-0.5 break-keep text-base font-semibold text-[var(--color-text-muted)]">
                다 함께 단체사진
              </p>
            </li>
          </ul>

          <p className="mt-6 break-keep text-xs leading-relaxed text-[var(--color-text-muted)]">
            프로필 사진 출처: {PHOTO_CREDITS}.
            {HAS_MISSING_PHOTO ? " 사진이 확인되지 않은 팀은 잣송이 그림으로 대신했습니다." : ""}
          </p>
        </div>
      </section>

      {/* 다음 공연 — 끝난 페이지가 할 수 있는 가장 쓸모 있는 일이다.
          여기까지 읽은 사람은 이미 관심이 있는 사람이고, 그 관심을 아직 열리지
          않은 자리로 넘겨주는 것이 이 자리의 몫이다. */}
      <section className="bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Next
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            싸움은 아직 끝나지 않았습니다
          </h2>
          <p className="mt-4 break-keep text-lg leading-relaxed text-[var(--color-text-muted)]">
            잔치가 끝난 뒤에도 톱날은 숲으로 다가오고 있습니다. 10월 10일, 같은 마을회관
            앞에서 세 번째 자리가 열립니다.
          </p>
          <Link
            href="/concert/mok-jareugi"
            className="paper group mt-8 block overflow-hidden transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative z-[1] grid gap-6 p-5 sm:grid-cols-[minmax(0,0.5fr)_minmax(0,1fr)] sm:p-6">
              <div className="photo-frame">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
                  <Image
                    src="/images/concert/mok-jareugi-poster.jpg"
                    alt="목자르기 포스터"
                    fill
                    sizes="(max-width: 640px) 100vw, 260px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <span className="self-start rounded-full bg-[var(--color-warm)]/15 px-3 py-1 text-xs font-bold text-[var(--color-warm)]">
                  예정된 공연
                </span>
                <h3 className="mt-3 break-keep font-serif-display text-2xl font-bold leading-tight text-[var(--color-text)] sm:text-3xl">
                  목자르기
                </h3>
                <p className="mt-3 break-keep text-base leading-relaxed text-[var(--color-text-muted)]">
                  2026년 10월 10일(토) 오후 2시, 풍천리 마을회관 앞. 우리의 나무를 자르는
                  건 우리의 목을 자르는 거야.
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
        </div>
      </section>

      {/* 포스터 */}
      <section id="poster" className="scroll-mt-20 bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Record
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            그날의 포스터
          </h2>
          <p className="mt-3 break-keep text-base text-[var(--color-text-muted)]">
            마을 곳곳과 단체방에 걸렸던 포스터입니다.
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
              download="풍천리-잣나무-마을-잔치-포스터.jpg"
              className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--color-forest)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
            >
              포스터 내려받기
            </a>
          </div>

          {/* 공유해달라고 부탁만 하고 정작 공유할 수단이 없었다 */}
          <div className="mt-10 flex justify-center">
            <ShareButtons
              title={`${FEAST_TITLE} — ${FEAST_DATE_LABEL} ${FEAST_PLACE}`}
              url={FEAST_URL}
              page="concert-village-feast"
              section="poster"
              contentPrefix="concert.villageFeast.share"
            />
          </div>
        </div>
      </section>

      {/* 마무리 CTA — 푸터와 같은 색이면 경계가 사라지므로 한 단 밝은 어둠을 쓴다 */}
      <section className="ridge-tail relative overflow-hidden bg-[var(--color-deep-raised)] px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <Megaphone className="mx-auto h-10 w-10 text-[var(--color-earth-light)]" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-[16ch] text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            그날 못 오셨어도 함께할 수 있어요
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
