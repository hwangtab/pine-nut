"use client";

import type { CSSProperties, ReactNode } from "react";
import { MOK_FUNDING_LAST_DAY, MOK_FUNDING_URL } from "@/lib/concert";
import { useDday } from "@/lib/use-concert-status";

/**
 * 펀딩 링크. 마지막 날이 지나면 사라진다 — 페이지는 정적이라 빌드 시점에 판정하면
 * 배포가 없는 동안 마감된 펀딩을 계속 가리킨다. 서버 HTML 에는 링크가 실리고
 * (useDday 의 서버 스냅샷은 null), 마감 뒤에는 하이드레이션하면서 걷힌다.
 */
export default function FundingLink({
  className,
  style,
  children,
}: {
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const status = useDday(MOK_FUNDING_LAST_DAY);
  if (status?.over) return null;

  return (
    <a href={MOK_FUNDING_URL} className={className} style={style}>
      {children}
    </a>
  );
}
