"use client";

import { useSyncExternalStore } from "react";
import { dday, ddayLabel } from "@/lib/concert";

export interface DdayStatus {
  label: string;
  over: boolean;
}

const subscribe = () => () => {};

// useSyncExternalStore 는 같은 값이면 같은 객체 참조를 돌려줘야 무한 렌더를 피한다.
// 공연마다 기준 날짜가 다르므로 기준 시각별로 캐시한다.
const cache = new Map<number, DdayStatus>();

function snapshotFor(time: number): DdayStatus {
  const at = new Date(time);
  const next: DdayStatus = { label: ddayLabel(at), over: dday(at) < 0 };
  const prev = cache.get(time);
  if (prev && prev.label === next.label && prev.over === next.over) return prev;
  cache.set(time, next);
  return next;
}

/**
 * 공연까지 남은 날. 서버 스냅샷은 null 이다 — 정적 프리렌더 시점의 날짜가 HTML 에
 * 굳어버리면 배포 후 며칠이 지나도 옛 D-day 가 그대로 보인다.
 */
export function useDday(start: Date): DdayStatus | null {
  const time = start.getTime();
  return useSyncExternalStore(
    subscribe,
    () => snapshotFor(time),
    () => null,
  );
}
