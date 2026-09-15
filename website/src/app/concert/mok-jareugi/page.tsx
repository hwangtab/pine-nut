import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Car,
  Heart,
  MapPin,
  Megaphone,
  Phone,
  Share2,
  Thermometer,
  Ticket,
  Users,
} from "lucide-react";
import { OG_SITE, localeAlternates } from "@/lib/seo-alternates";
import { SITE_URL } from "@/lib/site-config";
import {
  MOK_ADDRESS,
  MOK_DATE_LABEL,
  MOK_LINEUP,
  MOK_PHONE_COMMITTEE,
  MOK_PHONE_STAGE,
  MOK_PHONE_STAGE_NAME,
  MOK_PLACE,
  MOK_START,
  MOK_SUBTITLE_LINES,
  MOK_TIME_LABEL,
  MOK_TITLE,
} from "@/lib/concert";
import { PineConeIcon } from "@/components/visuals/ForestLetterMotifs";
import ShareButtons from "@/components/ShareButtons";
import MokHero from "./MokHero";
import { SawBoundary } from "./MokMotifs";

const MOK_URL = `${SITE_URL}/concert/mok-jareugi`;
const LINEUP_NAMES = MOK_LINEUP.map((artist) => artist.name).join("·");
const POSTER_ALT = `${MOK_TITLE} 포스터 — ${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}. 출연: ${LINEUP_NAMES}`;

// 사진 출처는 페이지에 밝힌다 — 우리가 찍은 사진이 아니다.
const PHOTO_CREDITS = [
  ...new Set(MOK_LINEUP.map((artist) => artist.photoCredit).filter(Boolean)),
].join(" · ");
const HAS_MISSING_PHOTO = MOK_LINEUP.some((artist) => !artist.photo);

// 검색엔진·AI 검색이 이 페이지를 "10월 10일 홍천에서 열리는 무료 공연"으로 읽게 하는
// 구조화 데이터. 포스터를 놓친 사람이 검색으로 찾아오는 경로다. 주최 측이 밝힌
// 종료 시각은 '6시경'이라 endDate 를 넣지 않는다 — 어림한 시각을 구조화 데이터에
// 박으면 캘린더와 리치결과에는 확정된 시각으로 들어간다. 화면 문구로만 안내한다.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: MOK_TITLE,
  startDate: MOK_START.toISOString(),
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: MOK_PLACE,
    address: { "@type": "PostalAddress", addressCountry: "KR", streetAddress: MOK_ADDRESS },
  },
  performer: MOK_LINEUP.map((artist) => ({
    "@type": "PerformingGroup",
    name: artist.name,
  })),
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "KRW",
    availability: "https://schema.org/InStock",
    url: MOK_URL,
  },
  image: [`${SITE_URL}/images/concert/mok-jareugi-og.jpg`],
  description: `${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}. 벌목을 앞둔 잣나무 숲 앞에서 음악가 ${MOK_LINEUP.length}팀이 함께합니다. 관람료는 없습니다.`,
  organizer: { "@type": "Organization", name: "풍천리 양수발전소 건설 반대 대책위원회" },
};

export const metadata: Metadata = {
  alternates: localeAlternates("/concert/mok-jareugi"),
  title: `${MOK_TITLE} — ${MOK_DATE_LABEL} 풍천리`,
  description: `${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}. 곧 베어질 잣나무 숲에서 음악가 ${MOK_LINEUP.length}팀이 노래합니다. 무료.`,
  openGraph: {
    ...OG_SITE,
    title: `${MOK_TITLE} — ${MOK_DATE_LABEL} 풍천리`,
    description: `${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}. 잣나무가 베어지기 전에, 음악가 ${MOK_LINEUP.length}팀이 모입니다.`,
    url: MOK_URL,
    images: [
      {
        url: `${SITE_URL}/images/concert/mok-jareugi-og.jpg`,
        width: 1200,
        height: 630,
        alt: POSTER_ALT,
      },
    ],
  },
  // twitter:card 이 없으면 X 는 og:image 를 작은 정사각 썸네일로 줄여 붙인다.
  // 1.91:1 카드를 만들어둔 이상 큰 가로 카드로 뜨게 명시한다.
  twitter: {
    card: "summary_large_image",
    title: `${MOK_TITLE} — ${MOK_DATE_LABEL} 풍천리`,
    description: `${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}. 잣나무가 베어지기 전에, 음악가 ${MOK_LINEUP.length}팀이 모입니다.`,
    images: [`${SITE_URL}/images/concert/mok-jareugi-og.jpg`],
  },
};

const INFO_CARDS = [
  { icon: CalendarDays, label: "일시", value: MOK_DATE_LABEL, sub: MOK_TIME_LABEL },
  { icon: MapPin, label: "장소", value: MOK_PLACE, sub: "강원 홍천 화촌면" },
  { icon: Ticket, label: "관람", value: "무료", sub: "예매 없이 누구나" },
  {
    icon: Phone,
    label: "문의",
    value: MOK_PHONE_COMMITTEE,
    sub: "대책위 이창후 총무",
    href: `tel:${MOK_PHONE_COMMITTEE}`,
  },
];

/* 이 페이지에 처음 오는 사람은 풍천리를 모른다. 포스터가 강렬해 포스터만 보고
   들어오는 비중이 높고, DJ·일렉 라인업은 앞선 두 공연의 포크 관객과 겹치지 않는다.
   그래서 숫자와 브리핑을 라인업보다 먼저 놓는다.

   숫자 표기는 press/factsheet·opengraph-image·layout 과 반드시 같아야 한다.
   한 곳만 다르면 어느 쪽이 맞는지 독자가 판단할 수 없다. */
const STATS = [
  { value: "약 11만", unit: "그루", label: "벌채 예정 잣나무" },
  { value: "705", unit: "회+", label: "주민들의 집회" },
  { value: "51", unit: "가구", label: "수몰·이주 대상" },
  { value: "8", unit: "년째", label: "이어온 싸움" },
];

/* 브리핑 본문. 출처는 docs/14-pungcheonri-source-dossier.md 다.
   그 문서 5장의 원칙을 따른다 — 공식 스펙은 한수원·산업부 고시 기준, 주민 주장과
   언론 보도는 구분, 숫자가 충돌하면 범위로 적고 더 극적인 쪽을 고르지 않는다. */
const BRIEFING = [
  {
    q: "무엇을 짓나",
    a: "홍천 양수발전소 1·2호기입니다. 600MW(300MW 두 기) 규모로, 사업면적은 1,530천㎡. 한국수력원자력이 추진하고 시공은 대우건설 공동수급체가 맡습니다. 준공 예정은 2032년 12월입니다.",
  },
  {
    q: "무엇이 사라지나",
    // 주최 측이 밝힌 벌채 수량은 111,999그루다. 숫자 카드는 사이트 전역 표기인
    // '약 11만'을 유지하고, 본문에서 한 번 정확한 수를 밝힌다 — 반올림한 숫자는
    // 머리에 남지만 세어본 숫자는 몸에 남는다.
    a: "산림청이 ‘100대 명품숲’으로 지정한 1,800ha 잣나무 숲이 훼손됩니다. 한국수력원자력이 베겠다는 잣나무는 111,999그루, 51가구가 살던 터는 물에 잠깁니다. 주민들은 이 숲에서 산양을 봤다고 증언합니다.",
  },
  {
    q: "왜 잣나무인가",
    a: "국내산 잣의 62%가 이 숲에서 납니다. 주민들에게 이 숲은 경치가 아니라 생계입니다. 나무가 없어지면 수입이 없어지고, 마을에 남을 이유도 없어집니다.",
  },
  {
    q: "누가 반대하나",
    a: "주민들입니다. 2019년 3월 첫 집회 이후 8년째, 705번이 넘게 거리에 섰습니다. 평균 연령은 약 70세. 전국 140여 개 단체가 곁에 서 있습니다.",
  },
  {
    q: "무엇을 치렀나",
    a: "2024년 7월 홍천군청 농성에서 주민들이 퇴거불응 혐의로 연행됐습니다(보도에 따라 7~8명). 같은 해 12월에는 총 1,800만원의 벌금 약식명령이 내려졌고, 반대위는 정식재판을 요구했습니다. 예순에서 여든의 손들이 지금 법정에 서 있습니다.",
  },
  {
    q: "베고 나면 끝인가",
    a: "베어지는 나무만 잃는 것이 아닙니다. 발전소가 들어서면 살아남은 잣나무들도 온전히 자라기 어려운 환경이 됩니다. 한 번 지으면 이 생태계는 돌이킬 수 없는 피해를 입습니다.",
  },
  {
    q: "지금 어디까지 왔나",
    a: "2025년 8월 29일 실시계획이 승인·고시됐고, 12월 공사계획이 인가됐습니다. 2026년 1월 본공사가 착공됐습니다. 이설도로를 낸다며 잣나무 2,256그루는 이미 쓰러졌습니다.",
    // 브리핑의 결론이라 두 칸을 다 쓴다. 홀로 남아 오른쪽이 비면 가장 중요한
    // 말이 가장 약한 자리에 놓인다.
    wide: true,
  },
];

const PARTICIPATE = [
  {
    icon: Share2,
    title: "오기 전, 알려주세요",
    body: "포스터와 이 페이지를 SNS·단체방에 공유해주세요. 이 숲이 잘린다는 걸 아는 사람이 한 명 더 늘어나는 것이 풍천리에는 힘입니다.",
  },
  {
    icon: Users,
    title: "현장에서, 함께해요",
    body: "함께 노래하고 웃고 떠들고 춤추며, 화내고 소리 질러주세요. 조용히 구경만 하는 자리가 아닙니다. 베어질 숲을 직접 보고, 사진을 찍어 ‘#풍천리’로 남겨주세요.",
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
    q: "몇 시에 시작하고 언제 끝나나요?",
    a: "오후 2시에 시작해 6시쯤 마칩니다. 팀별 순서는 아직 정해지지 않았습니다. 정해지는 대로 이 페이지에 올리겠습니다.",
  },
  {
    q: "풍천리가 어디인가요?",
    a: "강원도 홍천군 화촌면 풍천리입니다. 가리산 자락 해발 400~700m의 산촌 마을이고, 양수발전소 건설이 예정된 바로 그곳입니다.",
  },
  {
    q: "어떻게 가나요?",
    a: "대중교통이 드문 산촌 마을입니다. 자가용을 권하고, 함께 오실 분들끼리 차를 나눠 타시면 좋습니다. 이동이 어려우시면 대책위로 미리 연락 주세요.",
  },
  {
    q: "무엇을 준비하면 좋나요?",
    a: "야외 무대입니다. 10월 산간 지역은 해가 지면 기온이 뚝 떨어집니다. 앉을 자리(돗자리)와 두꺼운 겉옷을 꼭 챙기세요.",
  },
  {
    q: "아이와 함께 가도 되나요?",
    a: "됩니다. 다만 야외에서 앰프를 쓰는 공연이라 소리가 큽니다. 어린아이와 오신다면 귀마개를 준비하시면 좋습니다.",
  },
];

// 페이지의 FAQ 를 그대로 구조화한다 — "관람료 있나요" 같은 질문에 검색·AI 답변이
// 직접 답하게 하려면 화면 문구와 같은 내용이어야 한다.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function MokJareugiPage() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <MokHero />

      {/* 공연 안내 */}
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

      {/* 풍천리에서 무슨 일이 — 다크 밴드. 이 페이지의 독자는 여기서 처음 사정을 안다 */}
      <section className="relative overflow-hidden bg-[var(--color-deep)] px-6 pt-16 pb-24 sm:pt-20 sm:pb-32">
        <div className="relative z-[1] mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-earth-light)]">
            What&apos;s Happening
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-2xl font-bold text-white sm:text-3xl">
            풍천리에서 무슨 일이 벌어지고 있나
          </h2>
          <p className="mt-4 max-w-2xl break-keep text-base leading-relaxed text-white/75">
            이 공연을 처음 알게 되셨다면, 여기부터 읽어주세요. 90초면 됩니다.
          </p>

          <dl className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dd className="font-serif-display text-4xl font-bold leading-none text-[var(--color-earth-light)] sm:text-5xl">
                  {s.value}
                  <span className="ml-1 text-xl font-bold sm:text-2xl">{s.unit}</span>
                </dd>
                <dt className="mt-3 break-keep text-sm text-white/75 sm:text-base">{s.label}</dt>
              </div>
            ))}
          </dl>

          <dl className="mt-14 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {BRIEFING.map((item) => (
              <div key={item.q} className={item.wide ? "sm:col-span-2" : undefined}>
                <dt className="break-keep text-lg font-bold text-white">{item.q}</dt>
                <dd
                  className={`mt-2 break-keep leading-relaxed ${
                    item.wide ? "text-base text-white/90 sm:text-lg" : "text-[15px] text-white/75"
                  }`}
                >
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Link href="/story" className="letter-btn letter-btn--outline">
              풍천리 이야기 자세히 보기 →
            </Link>
            <Link href="/timeline" className="letter-btn letter-btn--outline">
              8년의 기록 보기 →
            </Link>
          </div>
        </div>

        {/* 어둠과 크림이 맞닿는 자리를 톱니로 물어낸다. 띠를 따로 띄우면
            위아래 어디에도 붙지 않아 아무 뜻 없는 장식이 된다. */}
        <SawBoundary className="absolute bottom-0 left-0 h-10 w-full sm:h-14" />
      </section>


      {/* 왜 "목"인가 — 제목을 푸는 자리이자 경고의 핵심 */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Why &ldquo;목&rdquo;
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl">
            나무 목(木)과 목숨의 목은 같은 소리입니다
          </h2>

          <p className="mt-8 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            포스터에 적힌 제목은 <b className="font-bold">木자르기</b>입니다. 나무를 자른다는
            뜻이고, 동시에 목을 자른다는 뜻입니다. 말장난처럼 보이지만 풍천리에서는 말장난이
            아닙니다.
          </p>

          <div className="mt-10 rounded-[var(--radius-panel)] border-l-4 border-[var(--color-warm)] bg-[var(--color-bg-warm)] px-6 py-8 sm:px-10">
            <p className="font-hand break-keep text-2xl leading-relaxed text-[var(--color-warm)] sm:text-3xl">
              “{MOK_SUBTITLE_LINES[0]}
              <br />
              {MOK_SUBTITLE_LINES[1]}”
            </p>
            <p className="mt-4 text-sm text-[var(--color-text-muted)]">— 공연 포스터에서</p>
          </div>

          <p className="mt-10 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            잣나무가 이 마을의 수입입니다. 숲이 물을 머금어 논밭으로 내려보내고, 그 아래
            51가구가 삽니다. 나무를 베는 일은 풍경을 바꾸는 일이 아니라{" "}
            <b className="font-bold">사람이 여기서 계속 살 수 있는지를 결정하는 일</b>입니다.
            주민들이 8년을 버틴 이유가 그것입니다.
          </p>

          <p className="mt-8 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            그리고 지금, 베는 일이 시작됐습니다. 이설도로 공사로 2,256그루가 먼저 쓰러졌고
            본공사는 착공됐습니다.{" "}
            <b className="font-bold">톱날은 이미 숲의 가장자리를 지났습니다.</b>
          </p>

          <p className="mt-10 break-keep text-xl font-bold text-[var(--color-warm)] sm:text-2xl">
            10월 10일, 아직 서 있는 나무 앞에서 만납시다.
          </p>
        </div>
      </section>

      {/* 라인업 */}
      <section id="lineup" className="scroll-mt-20 bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Line-up
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            함께하는 음악가 {MOK_LINEUP.length}팀
          </h2>
          <p className="mt-3 break-keep text-sm leading-relaxed text-[var(--color-text-muted)]">
            포스터에 적힌 순서입니다. 오후 2시에 시작해 6시쯤 마치지만, 팀별 시각은
            아직 정해지지 않았습니다. 정해지는 대로 이 자리에 올리겠습니다.
          </p>

          <ul className="mt-10 space-y-2">
            {MOK_LINEUP.map((artist) => (
              <li key={artist.name} className="paper">
                <div className="relative z-[1] flex items-start gap-4 px-5 py-5">
                  {/* 사진이 없는 팀도 같은 자리를 차지해야 이름 줄이 어긋나지 않는다.
                      b2b 세트는 두 사람이라 원을 겹쳐 놓는다 — 한 사람만 걸면
                      나머지 한 사람이 없는 것처럼 읽힌다. */}
                  <div className="relative h-16 w-16 shrink-0 sm:h-20 sm:w-20">
                    {artist.photo ? (
                      <>
                        <span
                          className={`absolute overflow-hidden rounded-full ${
                            artist.photoSecondary
                              ? "left-0 top-0 h-11 w-11 sm:h-14 sm:w-14"
                              : "inset-0"
                          }`}
                        >
                          <Image
                            src={artist.photo}
                            alt={`${artist.name} 프로필 사진`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </span>
                        {artist.photoSecondary ? (
                          <span className="absolute bottom-0 right-0 h-11 w-11 overflow-hidden rounded-full ring-2 ring-[var(--color-bg-moss)] sm:h-14 sm:w-14">
                            <Image
                              src={artist.photoSecondary}
                              alt=""
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span
                        className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-bg-warm)] text-[var(--color-forest)]/45"
                        aria-hidden
                      >
                        <PineConeIcon className="h-8 w-8" />
                      </span>
                    )}
                  </div>

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

          <p className="mt-6 break-keep text-xs leading-relaxed text-[var(--color-text-muted)]">
            {PHOTO_CREDITS ? `프로필 사진 출처: ${PHOTO_CREDITS}. ` : ""}
            {HAS_MISSING_PHOTO ? "사진이 확인되지 않은 팀은 잣송이 그림으로 대신했습니다." : ""}
          </p>
        </div>
      </section>

      {/* 이렇게 함께해주세요 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl">
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
                  <p.icon className="h-7 w-7 text-[var(--color-forest)]" aria-hidden />
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
      <section className="px-6 pb-16 sm:pb-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Location
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            오시는 길
          </h2>
          <p className="mt-4 text-balance break-keep text-lg font-bold text-[var(--color-text)]">
            {MOK_PLACE} · {MOK_ADDRESS}
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
                  대중교통이 드무니 함께 오실 분들끼리 차를 나눠 타시면 좋습니다.
                </p>
              </div>
            </div>
            <div className="paper p-6">
              <div className="relative z-[1]">
                <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-forest)]">
                  <Thermometer className="h-5 w-5" aria-hidden />
                  10월 산간의 밤
                </span>
                <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  해발 수백 미터의 야외 무대입니다. 해가 지면 기온이 뚝 떨어지니 두꺼운 겉옷과
                  앉을 자리를 꼭 챙기세요. 이동이 어려우시면 대책위로 미리 연락 주세요.
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

      {/* 포스터 — 두 장이 나왔다. 대표는 붉은 목이고, 초록 글리치를 나란히 둔다 */}
      <section id="poster" className="scroll-mt-20 bg-[var(--color-bg-moss)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Spread the Word
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            포스터를 널리 알려주세요
          </h2>
          <p className="mt-3 break-keep text-base text-[var(--color-text-muted)]">
            두 가지가 있습니다. 내려받아 SNS·단체방·동네 게시판에 공유해주세요.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <figure className="photo-frame">
              <Image
                src="/images/concert/mok-jareugi-poster.jpg"
                alt={POSTER_ALT}
                width={1080}
                height={1440}
                sizes="(max-width: 640px) 100vw, 336px"
                className="h-auto w-full rounded-[2px]"
                priority={false}
              />
            </figure>
            <figure className="photo-frame">
              <Image
                src="/images/concert/mok-jareugi-poster-alt.jpg"
                alt={`${MOK_TITLE} 포스터(다른 버전) — ${MOK_DATE_LABEL} ${MOK_TIME_LABEL}, ${MOK_PLACE}`}
                width={1080}
                height={1350}
                sizes="(max-width: 640px) 100vw, 336px"
                className="h-auto w-full rounded-[2px]"
              />
            </figure>
          </div>

          <div className="mt-6 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <a
              href="/images/concert/mok-jareugi-poster.jpg"
              download="목자르기-포스터.jpg"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[var(--color-forest)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
            >
              포스터 저장하기
            </a>
            <a
              href="/images/concert/mok-jareugi-poster-alt.jpg"
              download="목자르기-포스터-2.jpg"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border-2 border-[var(--color-forest)] px-8 py-3.5 text-base font-bold text-[var(--color-forest)] transition-colors hover:bg-[var(--color-forest)]/10"
            >
              다른 버전 저장하기
            </a>
          </div>

          <div className="mt-10 flex justify-center">
            <ShareButtons
              title={`${MOK_TITLE} — ${MOK_DATE_LABEL} ${MOK_PLACE}`}
              url={MOK_URL}
              page="concert-mok-jareugi"
              section="poster"
              contentPrefix="concert.mokJareugi.share"
            />
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
            공연 문의{" "}
            <a
              href={`tel:${MOK_PHONE_COMMITTEE}`}
              className="font-bold text-[var(--color-forest)] hover:underline"
            >
              {MOK_PHONE_COMMITTEE}
            </a>{" "}
            (대책위 이창후 총무) · 무대 문의{" "}
            <a
              href={`tel:${MOK_PHONE_STAGE}`}
              className="font-bold text-[var(--color-forest)] hover:underline"
            >
              {MOK_PHONE_STAGE}
            </a>{" "}
            ({MOK_PHONE_STAGE_NAME})
          </p>
        </div>
      </section>

      {/* 마무리 CTA — 푸터와 같은 색이면 경계가 사라지므로 한 단 밝은 어둠을 쓴다 */}
      <section className="ridge-tail relative overflow-hidden bg-[var(--color-deep-raised)] px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <Megaphone className="mx-auto h-10 w-10 text-[var(--color-earth-light)]" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-[18ch] text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            풍천리에 오지 못해도 함께할 수 있어요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance break-keep text-base text-white/80 sm:text-lg">
            서명 한 번, 응원 한 줄, 후원 한 걸음이 아직 서 있는 나무를 지키는 힘이 됩니다.
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
