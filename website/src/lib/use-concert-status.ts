"use client";

import { useSyncExternalStore } from "react";
import { concertDdayLabel, isConcertOver } from "@/lib/concert";

interface ConcertStatus {
  label: string;
  over: boolean;
}

const subscribe = () => () => {};

let cached: ConcertStatus | null = null;

function getSnapshot(): ConcertStatus {
  const label = concertDdayLabel();
  const over = isConcertOver();
  if (!cached || cached.label !== label || cached.over !== over) {
    cached = { label, over };
  }
  return cached;
}

// 서버 스냅샷은 null → 정적 프리렌더에 D-day가 고정되지 않고 클라이언트에서 계산됨
export function useConcertStatus(): ConcertStatus | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}
