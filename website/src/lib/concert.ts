// 「베어지기 전에 풍천리」 공연(2026-08-01 청와대 앞) 정보·D-day 유틸

export const CONCERT_TITLE = "베어지기 전에 풍천리";
export const CONCERT_DATE_LABEL = "2026년 8월 1일(토)";
export const CONCERT_TIME_LABEL = "오후 1시 – 오후 8시";
export const CONCERT_PLACE = "청와대 앞";
export const CONCERT_PHONE = "010-8748-3044";

export const CONCERT_START = new Date("2026-08-01T13:00:00+09:00");
export const CONCERT_END = new Date("2026-08-01T20:00:00+09:00");

export const CONCERT_LINEUP = [
  "강민정",
  "경하와 세민과 멍구와 흑염소",
  "길가는 밴드",
  "김민정(알마즈)",
  "남수",
  "물장구클럽",
  "아나자오(ANAZAO)",
  "이서영",
  "자이",
  "제트싸이져",
  "종이코트",
  "치핵",
];

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function isConcertOver(now: Date = new Date()): boolean {
  return now.getTime() > CONCERT_END.getTime();
}

// KST 날짜 기준 남은 일수(양수: 공연 전, 0: 당일, 음수: 지남)
export function concertDday(now: Date = new Date()): number {
  const dayIndex = (t: number) => Math.floor((t + KST_OFFSET_MS) / DAY_MS);
  return dayIndex(CONCERT_START.getTime()) - dayIndex(now.getTime());
}

export function concertDdayLabel(now: Date = new Date()): string {
  const d = concertDday(now);
  if (d > 0) return `D-${d}`;
  if (d === 0) return "D-DAY";
  return "공연 종료";
}
