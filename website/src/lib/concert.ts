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
  "길가는 밴드",
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
  { start: "14:30", end: "15:00", name: "길가는 밴드" },
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
