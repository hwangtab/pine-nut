// 플로팅 캡슐 내비게이션과 페이지 상단 여백 판정을 위한 라우트 분류.

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
// UtilityHeader를 쓰므로 투명 내비(흰 글씨)가 아니라 frost 내비여야 읽힌다.
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
