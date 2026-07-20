import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarDays,
  Heart,
  MapPin,
  Megaphone,
  Phone,
  Share2,
  Ticket,
  Train,
  TreePine,
  Users,
} from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import {
  CONCERT_DATE_LABEL,
  CONCERT_PHONE,
  CONCERT_PLACE,
  CONCERT_TIME_LABEL,
  CONCERT_TIMETABLE,
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
  { icon: CalendarDays, label: "일시", value: `${CONCERT_DATE_LABEL}`, sub: CONCERT_TIME_LABEL },
  { icon: MapPin, label: "장소", value: CONCERT_PLACE, sub: "서울 종로구" },
  { icon: Ticket, label: "관람", value: "무료", sub: "예매 없이 누구나" },
  { icon: Phone, label: "문의", value: CONCERT_PHONE, sub: "대책위", href: `tel:${CONCERT_PHONE}` },
];

// 위기의 숫자 — 출처: 대책위 자료(사이트 llms.txt / 이야기 페이지)
const STATS = [
  { value: "11만", unit: "그루", label: "벌채 예정 잣나무", accent: "pink" as const },
  { value: "51", unit: "가구", label: "수몰·이주 대상", accent: "green" as const },
  { value: "1,800", unit: "ha", label: "국내 최대 잣나무 숲", accent: "green" as const },
  { value: "680", unit: "회+", label: "주민들의 집회", accent: "pink" as const },
];

const PARTICIPATE = [
  {
    icon: Share2,
    title: "오기 전, 알려주세요",
    body: "포스터와 이 페이지를 SNS·단체방에 공유해주세요. 한 사람이 더 아는 것만으로도 풍천리에 힘이 됩니다.",
  },
  {
    icon: Users,
    title: "현장에서, 함께해요",
    body: "자리를 채우는 것 자체가 연대입니다. 노래를 듣고, 사진을 찍어 ‘#풍천리’로 남겨주세요.",
  },
  {
    icon: Heart,
    title: "못 오셔도, 연대해요",
    body: "서명·후원·게시판 응원으로도 함께할 수 있습니다. 멀리 있어도 마음은 청와대 앞에 닿습니다.",
  },
];

const FAQ = [
  {
    q: "관람료가 있나요?",
    a: "무료입니다. 예매나 사전 신청 없이 누구나 오실 수 있어요.",
  },
  {
    q: "언제 가면 좋을까요?",
    a: "오후 1시부터 8시까지 언제든 자유롭게 오시면 됩니다. 보고 싶은 팀이 있다면 위 타임테이블을 참고하세요.",
  },
  {
    q: "무엇을 준비하면 좋나요?",
    a: "한여름 야외 공연입니다. 물, 양산이나 모자, 앉을 자리(돗자리)를 챙기시면 편하게 즐길 수 있어요.",
  },
  {
    q: "날씨가 궂으면 어떻게 되나요?",
    a: "야외 공연이라 날씨의 영향을 받을 수 있습니다. 변동 사항은 문의 전화와 이 페이지로 안내드립니다.",
  },
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
              className="rounded-2xl border border-[var(--color-border)] bg-white px-4 py-6 text-center shadow-sm"
            >
              <card.icon className="mx-auto h-7 w-7 text-[var(--color-forest)]" aria-hidden />
              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {card.label}
              </p>
              {card.href ? (
                <a
                  href={card.href}
                  className="mt-1 block break-keep text-lg font-black text-[var(--color-text)] hover:text-[var(--color-forest)]"
                >
                  {card.value}
                </a>
              ) : (
                <p className="mt-1 break-keep text-lg font-black text-[var(--color-text)]">
                  {card.value}
                </p>
              )}
              <p className="mt-0.5 break-keep text-xs text-[var(--color-text-muted)]">{card.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 왜 이 공연인가 */}
      <section className="px-6 pb-4 pt-4 sm:pb-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Why We Sing
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-3xl font-bold leading-tight text-[var(--color-text)] sm:text-4xl">
            숲이 베어지기 전에, 노래로 곁을 지킵니다
          </h2>

          {/* 첫 문단 + 숲 사진 */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-lg">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src="/images/pine-forest-1.jpg"
                alt="안개가 내려앉은 잣나무 숲"
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
              <p className="absolute bottom-4 left-5 right-5 text-sm font-medium text-white/90 drop-shadow">
                산림청이 꼽은 ‘100대 명품숲’ · 국내 최대 잣나무 숲
              </p>
            </div>
          </div>
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
              그 백 년을 <b className="font-bold text-[var(--color-warm)]">84개월</b>이면 지울 수
              있다고 합니다. 양수발전소가 들어서면 잣나무 11만 그루가 잘려 나가고, 51가구가
              물에 잠기거나 정든 집을 떠나야 합니다. 앞으로의 이야기가 아닙니다. 2024년 10월,
              이설도로를 낸다며 벌써 2,256그루가 먼저 쓰러졌습니다. 톱날은 이미 숲의 가장자리를
              파고들고 있습니다.
            </p>
            <div className="order-1 overflow-hidden rounded-3xl border border-[var(--color-border)] shadow-lg sm:order-2">
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src="/images/pine-forest-2.jpg"
                  alt="빛이 스며드는 숲 속"
                  fill
                  sizes="(max-width: 768px) 100vw, 340px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* 셋째 문단 — 강조 인용 블록 */}
          <div className="mt-12 rounded-3xl border-l-4 border-[var(--color-warm)] bg-[var(--color-bg-warm)] px-6 py-8 sm:px-10">
            <p className="break-keep text-lg leading-loose text-[var(--color-text)] sm:text-xl">
              주민들은 2019년부터 7년 동안 680번 넘게 거리에 섰습니다. 예순에서 여든의 손들이
              팻말을 들었고, 그 가운데 일곱 분은 지금 재판을 받고 있습니다. 이제 음악가 열두
              팀이 그 손을 마주 잡으러 청와대 앞에 섭니다. 숲이 사라지기 전에, 우리 노래가
              가닿아야 할 곳이 있습니다.
            </p>
            <p className="mt-5 break-keep text-xl font-bold text-[var(--color-warm)] sm:text-2xl">
              8월 1일, 당신이 앉을 자리 하나가 그 숲의 한 그루가 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 위기의 숫자 — 다크 네온 밴드(포스터 무드) */}
      <section className="mt-12 bg-[var(--color-forest)] px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[#3BEF7C]">
            What&apos;s at Stake
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-2xl font-bold text-white sm:text-3xl">
            우리가 지키려는 것
          </h2>
          <dl className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <dd
                  className={`text-4xl font-black leading-none sm:text-5xl ${
                    s.accent === "pink" ? "text-[#FF8CA0]" : "text-[#3BEF7C]"
                  }`}
                >
                  {s.value}
                  <span className="ml-1 text-xl font-bold sm:text-2xl">{s.unit}</span>
                </dd>
                <dt className="mt-3 break-keep text-sm text-white/75 sm:text-base">{s.label}</dt>
              </div>
            ))}
          </dl>
          <div className="mt-12 text-center">
            <Link
              href="/story"
              className="inline-flex min-h-[44px] items-center rounded-full border-2 border-white/50 px-6 py-3 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              풍천리 이야기 자세히 보기 →
            </Link>
          </div>
        </div>
      </section>

      {/* 타임테이블 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Time Table
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            함께하는 음악가 12팀
          </h2>
          <p className="mt-3 text-center text-sm text-[var(--color-text-muted)]">
            팀당 약 30분 · 현장 상황에 따라 순서와 시간이 조정될 수 있습니다.
          </p>
          <ol className="mt-10 space-y-2">
            {CONCERT_TIMETABLE.map((slot, i) => (
              <li
                key={slot.name}
                className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 shadow-sm transition-colors hover:border-[var(--color-warm)]/40 sm:gap-4 sm:px-5"
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

      {/* 이렇게 함께해주세요 */}
      <section className="bg-[var(--color-bg-warm)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Join Us
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            이렇게 함께해주세요
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {PARTICIPATE.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-warm)]/10 text-[var(--color-warm)]">
                  <p.icon className="h-6 w-6" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-bold text-[var(--color-text)]">{p.title}</h3>
                <p className="mt-2 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 오시는 길 */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Location
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            오시는 길
          </h2>
          <p className="mt-4 text-center text-lg font-bold text-[var(--color-text)]">
            청와대 앞 · 서울 종로구
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-forest)]">
                <Train className="h-5 w-5" aria-hidden />
                지하철
              </span>
              <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                3호선 <b className="text-[var(--color-text)]">경복궁역 4번 출구</b>에서 도보 약 15분,
                또는 <b className="text-[var(--color-text)]">안국역</b>에서 마을버스 이용.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-forest)]">
                <TreePine className="h-5 w-5" aria-hidden />
                한여름 야외 공연
              </span>
              <p className="mt-3 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                물, 양산·모자, 돗자리를 챙겨오시면 오래 편하게 함께할 수 있어요. 주변에 대형
                주차장이 없으니 대중교통을 권합니다.
              </p>
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center">
            <a
              href="https://map.kakao.com/link/search/%EC%B2%AD%EC%99%80%EB%8C%80"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#FEE500] px-6 py-3 text-base font-bold text-[#191919] transition-opacity hover:opacity-85"
            >
              카카오맵에서 보기
            </a>
            <a
              href="https://map.naver.com/p/search/%EC%B2%AD%EC%99%80%EB%8C%80"
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
      <section id="poster" className="scroll-mt-20 bg-[var(--color-bg-warm)] px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            Spread the Word
          </p>
          <h2 className="mt-3 text-balance break-keep text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            포스터를 널리 알려주세요
          </h2>
          <p className="mt-3 break-keep text-base text-[var(--color-text-muted)]">
            내려받아 SNS·단체방·동네 게시판에 공유해주세요.
          </p>
          <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-lg">
            <Image
              src="/images/concert/poster.jpg"
              alt="베어지기 전에 풍천리 공연 포스터 — 2026년 8월 1일 토요일 오후 1시부터 8시, 청와대 앞. 출연: 강민정, 경하와 세민과 멍구와 흑염소, 길가는 밴드, 김민정(알마즈), 남수, 물장구클럽, 삼각전파사, 아나자오, 이서영, 자이, 종이코트, 치핵"
              width={1200}
              height={1697}
              sizes="(max-width: 768px) 100vw, 672px"
              className="h-auto w-full"
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

      {/* FAQ */}
      <section className="px-6 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-bold uppercase tracking-[0.3em] text-[var(--color-warm)]">
            FAQ
          </p>
          <h2 className="mt-3 text-balance break-keep text-center text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
            자주 묻는 질문
          </h2>
          <dl className="mt-10 space-y-3">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
              >
                <dt className="text-lg font-bold text-[var(--color-text)]">Q. {item.q}</dt>
                <dd className="mt-2 break-keep text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            더 궁금한 점은{" "}
            <a
              href={`tel:${CONCERT_PHONE}`}
              className="font-bold text-[var(--color-forest)] hover:underline"
            >
              {CONCERT_PHONE}
            </a>{" "}
            (대책위)로 문의해주세요.
          </p>
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="relative overflow-hidden bg-[var(--color-forest)] px-6 py-20 text-center sm:py-24">
        <div className="mx-auto max-w-3xl">
          <Megaphone className="mx-auto h-10 w-10 text-[#3BEF7C]" aria-hidden />
          <h2 className="mx-auto mt-5 max-w-[16ch] text-balance break-keep text-3xl font-bold leading-tight text-white sm:text-4xl">
            공연장에 오지 못해도 함께할 수 있어요
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance break-keep text-base text-white/80 sm:text-lg">
            서명 한 번, 응원 한 줄, 후원 한 걸음이 풍천리의 숲을 지키는 힘이 됩니다.
          </p>
          <div className="mx-auto mt-8 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:max-w-none sm:flex-row sm:items-center sm:flex-wrap">
            <Link
              href="/petition"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-[var(--color-warm)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-[var(--color-warm-light)]"
            >
              서명하기
            </Link>
            <Link
              href="/board"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              게시판에 응원 남기기
            </Link>
            <Link
              href="/donate"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              후원하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
