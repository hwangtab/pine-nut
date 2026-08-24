// 전폭 페이퍼 내비게이션(히어로 사진 위에서는 투명, 그 외엔 불투명)과
// 페이지 상단 여백 판정을 위한 라우트 분류.

// 풀블리드 히어로(HomeHero/SubHero/ConcertHero)가 있어 내비 아래로
// 콘텐츠가 자연스럽게 깔리는 라우트 — 별도 상단 여백이 필요 없다.
const HERO_ROUTE_PREFIXES = [
  "/story",
  "/timeline",
  "/news",
  "/gallery",
  "/press",
  "/share",
  "/petition",
  "/donate",
  "/concert",
  "/en",
];

export function hasPageHero(pathname: string): boolean {
  if (pathname === "/") return true;
  return HERO_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

// 어두운 풀블리드 사진 히어로가 있어 내비를 '투명 유리(흰 잉크)'로 띄우는 라우트.
// padding 판정(hasPageHero, prefix)과 달리 exact 매칭이다:
// 목록 페이지(/news)는 사진 SubHero지만, 하위 상세(/news/[slug])는 밝은
// UtilityHeader를 쓰므로 투명 내비(흰 글씨)가 아니라 불투명 페이퍼 내비여야 읽힌다.
const TRANSPARENT_NAV_ROUTES = [
  "/",
  "/story",
  "/timeline",
  "/news",
  "/gallery",
  "/press",
  "/share",
  "/petition",
  "/donate",
  "/concert",
  "/en",
];

export function hasTransparentNavHero(pathname: string): boolean {
  return TRANSPARENT_NAV_ROUTES.includes(pathname);
}

// 자체 풀스크린 레이아웃(인증)이라 상단 여백이 불필요한 라우트.
const FULLSCREEN_ROUTES = ["/login", "/signup"];

export function isFullscreenRoute(pathname: string): boolean {
  return FULLSCREEN_ROUTES.includes(pathname);
}

// 콘텐츠가 페이지 최상단부터 시작해 플로팅 내비 아래로 여백이 필요한 라우트인지.
export function needsNavTopPadding(pathname: string): boolean {
  return !hasPageHero(pathname) && !isFullscreenRoute(pathname);
}

// ── 푸터 능선(RidgeDivider)과 그 아래 여백 ─────────────────────────────────
// 능선은 푸터 위로 겹쳐 그려지므로(마루: 모바일 30px / sm 42px / md 60px),
// 그만큼 + 숨 쉴 틈만큼의 빈 공간이 마지막 콘텐츠 아래에 있어야 한다.
// 그 여백은 PublicShell이 전역으로 한 번만 확보한다. 페이지가 각자
// pb-* 를 잡는 방식은 이미 세 번 어긋났고, 관리자가 섹션을 추가하면
// 손댈 개발자가 없어 구조적으로 재발한다.
//
// 마지막 섹션이 어두운 라우트는 여백을 넣으면 크림색 띠가 생기므로 제외한다.
// 단 "어둡다"와 "푸터와 같은 색"은 다르다 — 이 둘을 한 목록으로 묶으면
// 숲색으로 끝나는 페이지에서 능선까지 사라져 직선 경계가 된다.

// 마지막 섹션이 푸터와 **같은** --color-deep 인 라우트. 능선을 그려도
// deep-on-deep 이라 보이지 않으므로 능선·여백 모두 생략한다.
const DEEP_TAIL_ROUTES = ["/", "/concert"];

// 마지막 섹션이 어둡지만 푸터와 **다른** 색(--color-forest)인 라우트.
// 능선은 보이므로 그리되, 여백은 크림색 띠가 되므로 넣지 않는다.
const FOREST_TAIL_ROUTES = ["/story", "/en"];

// 능선 아래 빈 여백이 필요한가 — 마지막 섹션이 밝은 라우트만 해당.
export function needsFooterRidgeGap(pathname: string): boolean {
  return (
    !DEEP_TAIL_ROUTES.includes(pathname) && !FOREST_TAIL_ROUTES.includes(pathname)
  );
}

// 능선을 그릴 것인가 — 푸터와 같은 색으로 끝나는 라우트에서만 생략.
export function showsFooterRidge(pathname: string): boolean {
  return !DEEP_TAIL_ROUTES.includes(pathname);
}
