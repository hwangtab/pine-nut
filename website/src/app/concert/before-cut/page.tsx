import type { Metadata } from "next";
import { OG_SITE, localeAlternates } from "@/lib/seo-alternates";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  MapPin,
  Megaphone,
  Shirt,
  Ticket,
  Users,
} from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import {
  CONCERT_DATE_LABEL,
  CONCERT_LINEUP,
  CONCERT_PLACE,
  CONCERT_TIME_LABEL,
  CONCERT_TIMETABLE,
} from "@/lib/concert";
import ConcertHero from "./ConcertHero";

export const metadata: Metadata = {
  alternates: localeAlternates("/concert/before-cut"),
  title: "베어지기 전에 풍천리 — 8·1 청와대 앞 공연",
  description:
    "2026년 8월 1일(토), 청와대 앞. 잣나무 11만 그루가 베어지기 전에, 풍천리를 지키려는 음악가 14팀이 일곱 시간 동안 노래했습니다.",
  openGraph: {
    ...OG_SITE,
    title: "베어지기 전에 풍천리 — 8·1 청와대 앞 공연",
    description:
      "2026년 8월 1일(토), 청와대 앞. 풍천리를 지키려는 음악가 14팀이 일곱 시간 동안 노래했습니다.",
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
  { icon: CalendarDays, label: "일시", value: `${CONCERT_DATE_LABEL}`, sub: CONCERT_TIME_LABEL },
  { icon: MapPin, label: "장소", value: CONCERT_PLACE, sub: "사랑채 앞 도로" },
  { icon: Ticket, label: "관람", value: "무료", sub: "예매 없이 누구나" },
  { icon: Users, label: "출연", value: `${CONCERT_LINEUP.length}팀`, sub: "일곱 시간" },
];

// 위기의 숫자 — 출처: 대책위 자료(사이트 llms.txt / 이야기 페이지)
const STATS = [
  { value: "11만", unit: "그루", label: "벌채 예정 잣나무", accent: "pink" as const },
  { value: "51", unit: "가구", label: "수몰·이주 대상", accent: "green" as const },
  { value: "1,800", unit: "ha", label: "국내 최대 잣나무 숲", accent: "green" as const },
  { value: "705", unit: "회+", label: "주민들의 집회", accent: "pink" as const },
];

export default function ConcertPage() {
  return (
    <div>
      <ConcertHero />

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
                <p className="mt-1 break-keep text-lg font-bold text-[var(--color-text)]">
                  {card.value}
                </p>
                <p className="mt-0.5 break-keep text-xs text-[var(--color-text-muted)]">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 왜 이 공연인가 */}
      <section className="px-6 pb-4 pt-4 sm:pb-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Why We Sing
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl">
            숲이 베어지기 전에, 노래로 곁을 지켰습니다
          </h2>

          {/* 첫 문단 + 숲 사진 */}
          <figure className="photo-frame mt-10">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2px]">
              <Image
                src="/images/concert/real-canopy.jpg"
                alt="풍천리 잣나무 숲을 아래에서 올려다본 실제 모습"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
            <figcaption className="font-hand mt-2 px-1 text-lg text-[var(--color-text-muted)]">
              산림청이 꼽은 ‘100대 명품숲’ · 국내 최대 잣나무 숲 (풍천리 현지 사진)
            </figcaption>
          </figure>
          <p className="mt-8 break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
            <b className="font-bold">백 년입니다.</b> 풍천리 잣나무가 지금 키에 이르기까지 걸린
            시간이. 강원도 홍천 가리산 자락에 1,800헥타르로 펼쳐진 이 숲을 산림청은 ‘100대
            명품숲’으로 꼽았습니다. 국내에서 가장 큰 잣나무 숲입니다. 나무 사이로 산양이
            지나가고, 까막딱다구리가 둥지를 틀고, 골짜기에는 수달이 삽니다. 마을 사람 열에
            일곱은 이 숲이 떨어뜨린 잣을 주워 한 해를 납니다. 이곳 사람들에게 숲은 살림이자
            이웃이고, 백 년을 함께 산 식구입니다.
          </p>

          {/* 둘째 문단 — 위기, 톱날 이미지 */}
          <div className="mt-12 grid gap-6 sm:grid-cols-[1fr_0.9fr] sm:items-center">
            <p className="order-2 break-keep text-base leading-loose text-[var(--color-text-muted)] sm:order-1 sm:text-lg">
              그 백 년을 <b className="font-bold text-[var(--color-forest)]">84개월</b>이면 지울 수
              있다고 합니다. 양수발전소가 들어서면 잣나무 11만 그루가 잘려 나가고, 51가구가
              물에 잠기거나 정든 집을 떠나야 합니다. 앞으로의 이야기가 아닙니다. 2024년 10월,
              이설도로를 낸다며 벌써 2,256그루가 먼저 쓰러졌습니다. 톱날은 이미 숲의 가장자리를
              파고들고 있습니다.
            </p>
            <figure className="photo-frame paper-tilt-r order-1 sm:order-2">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2px]">
                <Image
                  src="/images/concert/real-logs.jpg"
                  alt="풍천리에서 실제로 베어진 잣나무들이 쌓여 있는 모습"
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-cover"
                />
              </div>
            </figure>
          </div>

          {/* 셋째 문단 — 강조 인용 블록 */}
          <div className="mt-12 rounded-[var(--radius-panel)] border-l-4 border-[var(--color-forest)] bg-[var(--color-bg-warm)] px-6 py-8 sm:px-10">
            <p className="break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
              주민들은 2019년부터 8년째 705번 넘게 거리에 섰습니다. 예순에서 여든의 손들이
              팻말을 들었고, 그 가운데 일곱 분은 지금도 재판을 받고 있습니다. 그 손을 마주
              잡으러 음악가 열네 팀이 청와대 앞에 섰습니다. 일곱 시간 동안 노래가 끊이지
              않았습니다.
            </p>
            <p className="mt-5 break-keep text-xl font-bold text-[var(--color-forest)] sm:text-2xl">
              그날 앉았던 자리 하나하나가 그 숲의 한 그루였습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 위기의 숫자 — 다크 밴드 */}
      <section className="mt-12 bg-[var(--color-deep)] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-earth-light)]">
            What&apos;s at Stake
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-2xl font-bold text-white sm:text-3xl">
            우리가 지키려는 것
          </h2>
          <dl className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dd
                  className={`font-serif-display text-4xl font-bold leading-none sm:text-5xl ${
                    s.accent === "pink" ? "text-[var(--color-earth-light)]" : "text-[var(--color-forest-on-dark)]"
                  }`}
                >
                  {s.value}
                  <span className="ml-1 text-xl font-bold sm:text-2xl">{s.unit}</span>
                </dd>
                <dt className="mt-3 break-keep text-sm text-white/75 sm:text-base">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-12">
            <Link href="/story" className="letter-btn letter-btn--outline">
              풍천리 이야기 자세히 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 타임테이블 */}
      <section id="timetable" className="scroll-mt-20 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Time Table
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            함께한 음악가 14팀
          </h2>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            팀당 30분씩, 그날 예정했던 순서입니다.
          </p>
          <ol className="mt-10 space-y-2">
            {CONCERT_TIMETABLE.map((slot, i) => (
              <li key={slot.name} className="paper transition-colors hover:border-[var(--color-forest)]/40">
                <div className="relative z-[1] flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-5">
                  <span className="w-7 shrink-0 text-sm font-bold text-[var(--color-forest)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-[7.5rem] shrink-0 text-sm font-bold tabular-nums text-[var(--color-text-muted)]">
                    {slot.start} – {slot.end}
                  </span>
                  <span className="break-keep text-base font-bold leading-snug text-[var(--color-text)]">
                    {slot.name}
                  </span>
                </div>
              </li>
            ))}
            <li className="flex items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-[var(--color-border)] px-4 py-4 sm:gap-4 sm:px-5">
              <span className="w-7 shrink-0" aria-hidden />
              <span className="w-[7.5rem] shrink-0 text-sm font-bold tabular-nums text-[var(--color-text-muted)]">
                20:00 – 20:10
              </span>
              <span className="break-keep text-base font-semibold text-[var(--color-text-muted)]">
                마무리 발언 · 단체사진
              </span>
            </li>
          </ol>
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
            그 뒤로도 자리는 이어졌습니다
          </h2>
          <p className="mt-4 break-keep text-lg leading-relaxed text-[var(--color-text-muted)]">
            9월에는 음악가들이 풍천리 마을로 내려가 잔치를 열었고, 10월 10일에는 같은
            마을회관 앞에서 세 번째 자리가 열립니다.
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

      {/* 현장 부스 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            On-site Booth
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            현장 부스도 함께했습니다
          </h2>
          <div className="paper mt-8 p-6 sm:p-8">
            <div className="relative z-[1] flex flex-col items-start gap-5 sm:flex-row">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-forest)]/10 text-[var(--color-forest)]">
                <Shirt className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text)]">
                  강원녹색당 — 실크스크린 · 풍천리 티셔츠 판매 부스
                </h3>
                <p className="mt-2 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  강원녹색당이 공연에 함께해 실크스크린 체험과 티셔츠 판매 부스를 열었습니다.
                  풍천리를 담아 새로 만든 티셔츠를 현장에서 만날 수 있었고, 부스는 공연
                  시간 내내(13:00~20:00) 운영됐습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 포스터 */}
      <section id="poster" className="scroll-mt-20 px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-forest)]">
            Record
          </p>
          <h2 className="mt-3 text-balance break-keep font-serif-display text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            그날의 포스터
          </h2>
          <p className="mt-3 break-keep text-base text-[var(--color-text-muted)]">
            거리와 단체방에 걸렸던 포스터입니다.
          </p>
          <div className="photo-frame mt-8">
            <Image
              src="/images/concert/poster.jpg"
              alt="베어지기 전에 풍천리 공연 포스터 — 2026년 8월 1일 토요일 오후 1시부터 8시, 청와대 앞. 출연: 강민정, 강상석, 경하와 세민과 멍구와 흑염소, 길가는밴드 장현호, 김민정(알마즈), 남수, 물장구클럽, 삼각전파사, 아나자오, 이서영, 자이, 종이코트, 치핵, 하늘소년"
              width={1200}
              height={1500}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-auto w-full rounded-[2px]"
            />
          </div>
          <div className="mt-6">
            <a
              href="/images/concert/poster.jpg"
              download="베어지기전에-풍천리-포스터.jpg"
              className="inline-flex min-h-[48px] items-center rounded-full bg-[var(--color-forest)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-forest-light)]"
            >
              포스터 저장하기
            </a>
          </div>
        </div>
      </section>

      {/* 마무리 CTA */}
      {/* 마무리 CTA — 푸터와 같은 색이면 경계가 사라지므로 한 단 밝은 어둠을 쓴다 */}
      <section className="ridge-tail relative overflow-hidden bg-[var(--color-deep-raised)] px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <Megaphone className="mx-auto h-10 w-10 text-[var(--color-earth-light)]" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-[16ch] text-balance break-keep font-serif-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            공연장에 오지 못해도 함께할 수 있어요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance break-keep text-base text-white/80 sm:text-lg">
            서명 한 번, 응원 한 줄, 후원 한 걸음이 풍천리의 숲을 지키는 힘이 됩니다.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:flex-wrap">
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
