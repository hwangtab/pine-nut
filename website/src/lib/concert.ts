// 「베어지기 전에 풍천리」 공연(2026-08-01 청와대 앞) 정보·D-day 유틸

export const CONCERT_TITLE = "베어지기 전에 풍천리";
export const CONCERT_DATE_LABEL = "2026년 8월 1일(토)";
export const CONCERT_TIME_LABEL = "오후 1시 – 오후 8시";
export const CONCERT_PLACE = "청와대 앞";
export const CONCERT_PHONE = "010-8748-3044";

export const CONCERT_START = new Date("2026-08-01T13:00:00+09:00");
// 14팀(30분×14=7시간) + 마무리 10분 → 20:10 종료
export const CONCERT_END = new Date("2026-08-01T20:10:00+09:00");

export const CONCERT_LINEUP = [
  "강민정",
  "강상석",
  "경하와 세민과 멍구와 흑염소",
  "길가는밴드 장현호",
  "김민정(알마즈)",
  "남수",
  "물장구클럽",
  "삼각전파사",
  "아나자오(ANAZAO)",
  "이서영",
  "자이",
  "종이코트",
  "치핵",
  "하늘소년",
];

export interface ConcertSlot {
  start: string;
  end: string;
  name: string;
}

// 공연 순서: 팀당 30분씩 연속 배정. 마무리 발언·단체사진 10분은 페이지에서 별도 표기.
export const CONCERT_TIMETABLE: ConcertSlot[] = [
  { start: "13:00", end: "13:30", name: "물장구클럽" },
  { start: "13:30", end: "14:00", name: "강민정" },
  { start: "14:00", end: "14:30", name: "경하와 세민과 멍구와 흑염소" },
  { start: "14:30", end: "15:00", name: "길가는밴드 장현호" },
  { start: "15:00", end: "15:30", name: "아나자오(ANAZAO)" },
  { start: "15:30", end: "16:00", name: "강상석" },
  { start: "16:00", end: "16:30", name: "이서영" },
  { start: "16:30", end: "17:00", name: "김민정(알마즈)" },
  { start: "17:00", end: "17:30", name: "자이" },
  { start: "17:30", end: "18:00", name: "남수" },
  { start: "18:00", end: "18:30", name: "종이코트" },
  { start: "18:30", end: "19:00", name: "하늘소년" },
  { start: "19:00", end: "19:30", name: "삼각전파사" },
  { start: "19:30", end: "20:00", name: "치핵" },
];

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// KST 날짜 기준 남은 일수(양수: 공연 전, 0: 당일, 음수: 지남).
// 공연마다 날짜가 다르므로 기준 시각을 인자로 받는다 — 특정 공연에 묶어두면
// 다음 공연이 잡힐 때마다 상수를 갈아끼워야 하고, 갈아끼우는 걸 잊으면
// 홈 배너가 지난 공연을 계속 가리킨다.
export function dday(start: Date, now: Date = new Date()): number {
  const dayIndex = (t: number) => Math.floor((t + KST_OFFSET_MS) / DAY_MS);
  return dayIndex(start.getTime()) - dayIndex(now.getTime());
}

export function ddayLabel(start: Date, now: Date = new Date()): string {
  const d = dday(start, now);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-DAY";
  return "공연 종료";
}

// ── 「풍천리 좋은 마을 잔치」(2026-09-05 풍천리 마을회관) ────────────────────
// 첫 예술연대가 청와대 앞으로 '올라간' 공연이었다면, 이번은 음악가들이 마을로
// '내려오는' 잔치다. 2025년 7월 같은 마을회관에서 열린 「잣나무골 여름잔치」의
// 두 번째 자리이기도 하다.

export const FEAST_TITLE = "풍천리 좋은 마을 잔치";
export const FEAST_DATE_LABEL = "2026년 9월 5일(토)";
export const FEAST_TIME_LABEL = "오후 1시 시작";
export const FEAST_PLACE = "풍천리 마을회관";
export const FEAST_ADDRESS = "강원도 홍천군 화촌면 풍천리";
export const FEAST_START = new Date("2026-09-05T13:00:00+09:00");

/** 대책위 문의(이창후 총무) */
export const FEAST_PHONE_COMMITTEE = "010-8918-8933";
/** 공연 문의 */
export const FEAST_PHONE_STAGE = "010-8748-3044";

export interface FeastArtist {
  name: string;
  /** 한 줄 소개. 확인된 자료가 없으면 비운다 — 지어내지 않는다. */
  blurb?: string;
  /** blurb 의 출처 URL */
  source?: string;
}

// 포스터에 적힌 순서 그대로. 소개는 공개된 자료로 확인된 것만 적는다.
export const FEAST_LINEUP: FeastArtist[] = [
  {
    name: "경하와 세민",
    blurb:
      "재개발로 쫓겨나는 자리, 세상을 떠난 이를 기리는 자리에서 노래해온 듀오. 「그물에 걸리지 않는 바람」을 불렀습니다.",
    source: "https://music.bugs.co.kr/track/31264665",
  },
  {
    name: "김동산과 블루이웃",
    blurb:
      "수원의 포크·블루스 음악가 김동산과 밴드 블루이웃. 해고 노동자와 쫓겨나는 상인들의 이야기를 노래해 ‘한국의 우디 거스리’로 불립니다.",
    source: "https://peaceandmusic.net/album/musicians/3",
  },
  {
    name: "길가는밴드 장현호",
    blurb:
      "싱어송라이터 장현호를 중심으로 2011년 결성된 거리 밴드. 세월호, 강정마을, KTX 해고 승무원 — 십수 년을 현장에서 불러왔습니다.",
    source: "https://peaceandmusic.net/camps/2026/musicians/15",
  },
  { name: "마쓰모토 코타" },
  { name: "박지휘" },
  {
    name: "삼각전파사",
    blurb:
      "2015년부터 활동해온 로파이 전자음악 밴드. 1980년대 민중음악을 신디사이저의 언어로 다시 씁니다. 첫 정규 「Dystopia 2025」.",
    source: "https://bbs.ruliweb.com/news/read/209283",
  },
  {
    name: "자이",
    blurb:
      "인디 1세대 밴드 헤디마마의 보컬·베이스를 거쳐, 지금은 낮은 중저음과 정직한 선율의 네오소울 포크를 씁니다.",
    source: "https://peaceandmusic.net/camps/2026/musicians/11",
  },
  {
    name: "최양다음 NEXT",
    blurb: "독학으로 음악을 익힌 싱어송라이터. 여러 나라 말로 노래합니다.",
    source: "https://www.instagram.com/nextisnexttoyou/",
  },
  {
    name: "ZSTHYGER",
    blurb:
      "2018년부터 홍대에서 활동해온 컨트리 블루스 음악가 제트싸이져. 낮고 거친 목소리로 현대의 고딕을 노래합니다.",
    source: "https://peaceandmusic.net/camps/2026/musicians/27",
  },
];

// ── 예술연대 아카이브 ──────────────────────────────────────────────────────
// 공연은 정해진 주기 없이 열린다. 그래서 회차 번호를 쓰지 않고, 끝난 공연을
// 아래 배열에 최신순으로 쌓기만 한다. 다음 공연 날짜가 잡히면 upcoming: true 로
// 항목을 추가하면 /concert 목록 맨 위에 예정 공연으로 뜬다.
export interface ConcertEntry {
  /** /concert/{slug} */
  slug: string;
  /** D-day 계산 기준. 배너·히어로가 이 값만 보고 다음 공연을 안내한다. */
  startAt: Date;
  title: string;
  /** 내비 하위 메뉴에 쓰는 짧은 이름 */
  navLabel: string;
  dateLabel: string;
  timeLabel: string;
  place: string;
  posterImage: string;
  posterAlt: string;
  summary: string;
  lineupCount: number;
  /** 아직 열리지 않은 공연 */
  upcoming?: boolean;
}

export const CONCERTS: ConcertEntry[] = [
  {
    slug: "village-feast",
    startAt: FEAST_START,
    title: FEAST_TITLE,
    navLabel: FEAST_TITLE,
    dateLabel: FEAST_DATE_LABEL,
    timeLabel: FEAST_TIME_LABEL,
    place: FEAST_PLACE,
    posterImage: "/images/concert/village-feast-poster.jpg",
    posterAlt: "풍천리 좋은 마을 잔치 포스터 — 2026년 9월 5일 토요일 오후 1시",
    summary:
      "이번엔 음악가들이 마을로 내려옵니다. 7년을 싸워온 사람들이 하루쯤은 웃고 먹고 춤추는, 풍천리 마을회관 앞마당의 잔치입니다.",
    lineupCount: FEAST_LINEUP.length,
    upcoming: true,
  },
  {
    slug: "before-cut",
    startAt: CONCERT_START,
    title: CONCERT_TITLE,
    navLabel: "베어지기 전에, 풍천리",
    dateLabel: CONCERT_DATE_LABEL,
    timeLabel: CONCERT_TIME_LABEL,
    place: CONCERT_PLACE,
    posterImage: "/images/concert/poster.jpg",
    posterAlt: "베어지기 전에 풍천리 공연 포스터",
    summary:
      "잣나무 11만 그루가 베어지기 전에, 풍천리를 지키려는 음악가들이 청와대 앞에 모였습니다. 일곱 시간 동안 이어진 첫 번째 예술연대입니다.",
    lineupCount: CONCERT_LINEUP.length,
  },
];

/** 아직 열리지 않은 공연(없으면 null) */
export function upcomingConcert(): ConcertEntry | null {
  return CONCERTS.find((concert) => concert.upcoming) ?? null;
}

/** 이미 열린 공연 — 목록에서 아카이브로 보여준다 */
export function pastConcerts(): ConcertEntry[] {
  return CONCERTS.filter((concert) => !concert.upcoming);
}
