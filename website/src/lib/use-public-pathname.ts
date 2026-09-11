"use client";

import { usePathname } from "next/navigation";

/**
 * 공개 화면이 쓰는 pathname. next/navigation 의 usePathname 을 감싸 루트를
 * 항상 "/" 로 돌려준다.
 *
 * Vercel 이 홈(ISR)을 재생성할 때 함수로 들어오는 요청 경로가 "/" 가 아니라
 * 내부 키인 "/index" 다. 그 렌더에서 usePathname() 은 "/index" 를 돌려주고,
 * 그 값으로 판정하는 모든 것 — 사진 위 투명 내비, 히어로 없는 페이지용 상단
 * 여백, 푸터 능선 여백, 관리자가 홈에 붙인 섹션 — 이 "홈이 아닌 페이지"로
 * 그려진 채 CDN 에 굳는다. 실제로 헤더가 불투명해지고 그 아래 크림색 띠가
 * 깔린 홈이 반나절 넘게 서빙됐다(라우터 상태 c:["","index"] 로 확인).
 * 빌드 때 프리렌더한 HTML 은 "/" 라 멀쩡해서 배포 직후엔 드러나지 않는다.
 *
 * 공개 화면에서 경로 판정이 필요하면 usePathname 대신 이걸 쓴다.
 */
export function usePublicPathname(): string {
  const pathname = usePathname();
  return pathname === "/index" ? "/" : pathname;
}
