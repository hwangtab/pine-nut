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
  "/concert/before-cut",
  "/concert/village-feast",
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
// 능선은 푸터 위로 겹쳐 그려지므로(마루: 모바일 30px / sm 42px / md 60px)
// 그만큼 + 숨 쉴 틈이 마지막 콘텐츠 아래에 있어야 한다.
//
// 그 여백은 별도 요소가 아니라 globals.css의 `.footer-ridge-gap > :last-child`
// 패딩으로 준다. 여백을 별도 요소로 두면 그 요소의 배경이 페이지 배경과 달라
// 반드시 가로 이음매가 생긴다 — 실제로 모래빛으로 끝나는 페이지에서 발생했다.
// 마지막 블록 '안쪽' 패딩이면 그 블록의 배경이 그대로 늘어나 색이 어긋날 수 없다.
//
// 단, 그 규칙은 main의 '직계' 마지막 자식이 배경을 칠할 때만 성립한다.
// 자기 색을 칠하는 섹션이 배경 없는 래퍼 안에 중첩돼 있으면 여백은 래퍼에
// 붙어 크림색으로 칠해진다 — /story·/en 에서 실제로 그렇다.
// 그래서 원칙은 하나다: **자기 색을 칠하는 섹션은 자기 하단 여백을 직접 갖는다.**
// 전역 여백은 페이지 배경으로 끝나는 라우트에만 준다.

// 어두운 색으로 끝나지만 푸터(--color-deep)와는 **다른** 색인 라우트.
// 능선은 보여야 하므로 그리되, 전역 여백은 주지 않는다 — 그 섹션이 자기
// 하단 패딩으로 능선 마루(md 60px)를 이미 비우기 때문이다.
// 전역 여백을 얹으면 그 섹션 '바깥'에 붙어 어두운 색과 크림색 사이에
// 가로 이음매가 생긴다.
//
//   /                        home.stats  bg-deep-raised  py-16 md:py-20 (64/80px)
//   /concert/before-cut      마무리 CTA   bg-deep-raised  py-20 sm:py-24 (80/96px)
//   /concert/village-feast   마무리 CTA   bg-deep-raised  py-20 sm:py-24 (80/96px)
//   /story                   story.cta   bg-forest       py-20 md:py-28 (80/112px)
//   /en                      en.cta      bg-forest       py-20 md:py-28 (80/112px)
//
// → 이 패딩과 색은 scripts/check-footer-clearance.mjs 가 지킨다.
//   특히 밴드 색이 --color-deep 으로 되돌아가면 푸터와 같아져 능선이 사라진다.
const DARK_TAIL_ROUTES = ["/", "/story", "/en", "/concert/before-cut", "/concert/village-feast"];

// 능선 아래 여백을 전역으로 줄 것인가.
export function needsFooterRidgeGap(pathname: string): boolean {
  return !DARK_TAIL_ROUTES.includes(pathname);
}
