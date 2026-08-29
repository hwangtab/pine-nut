import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

for (const path of [
  "src/components/home/HomeAboutSection.tsx",
  "src/components/home/HomeImpactSection.tsx",
  "src/components/home/HomeHopeSection.tsx",
  "src/components/home/HomeQuotesSection.tsx",
  "src/components/home/HomeStatsSection.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

// src/app/page.tsx는 82d4c30에서 라우트 메타데이터 전용 서버 컴포넌트로 축소됐고,
// 화면 조립(섹션 컴포지션)은 src/components/home/HomeClient.tsx로 옮겨졌다(이유는
// page.tsx 상단 주석과 CLAUDE.md 참고). 그래서 조립 검증은 HomeClient.tsx를 봐야 한다.
const pagePath = "src/components/home/HomeClient.tsx";
const pageSource = read(pagePath);
for (const componentName of [
  "HomeAboutSection",
  "HomeImpactSection",
  "HomeHopeSection",
  "HomeQuotesSection",
  "HomeStatsSection",
]) {
  assert(pageSource.includes(componentName), `HomeClient must compose ${componentName}.`);
}

for (const removedResponsibility of [
  "EditableText",
  "EditableImage",
  "EditableList",
  "FadeIn",
  "PineTreeIcon",
  "home.impact.cards",
  "home.hope.cards",
  "home.quotes.items",
  "home.stats.items",
]) {
  assert(
    !pageSource.includes(removedResponsibility),
    `HomeClient should not own ${removedResponsibility}.`,
  );
}

const pageLines = pageSource.trimEnd().split("\n").length;
assert(pageLines <= 180, `HomeClient should stay orchestration-focused, got ${pageLines} lines.`);

const aboutSource = read("src/components/home/HomeAboutSection.tsx");
for (const expected of ["EditableImage", "home.about.forestImage", "PineTreeIcon"]) {
  assert(aboutSource.includes(expected), `HomeAboutSection must include ${expected}.`);
}

// 카드별 그라디언트 배경("gradients")과 흰색 인라인 SVG 아이콘("svgIcons")은 종이 카드
// 리디자인에서 의도적으로 삭제됐다(번호 + 순텍스트로 대체) — 되살리면 안 되는 죽은 배열이니
// 이 문자열들을 다시 요구 목록에 넣지 말 것.
const impactSource = read("src/components/home/HomeImpactSection.tsx");
for (const expected of ["EditableList", "home.impact.cards"]) {
  assert(impactSource.includes(expected), `HomeImpactSection must include ${expected}.`);
}

const hopeSource = read("src/components/home/HomeHopeSection.tsx");
for (const expected of ["EditableList", "home.hope.cards", "home.hope.protestPhoto"]) {
  assert(hopeSource.includes(expected), `HomeHopeSection must include ${expected}.`);
}

const quotesSource = read("src/components/home/HomeQuotesSection.tsx");
for (const expected of ["EditableList", "home.quotes.items", "blockquote"]) {
  assert(quotesSource.includes(expected), `HomeQuotesSection must include ${expected}.`);
}

const statsSource = read("src/components/home/HomeStatsSection.tsx");
for (const expected of ["EditableList", "home.stats.items", "stat.number"]) {
  assert(statsSource.includes(expected), `HomeStatsSection must include ${expected}.`);
}

// ---------------------------------------------------------------------------
// 홈 사회적 증거 토스트 — 데이터 공급원이 실제로 연결돼 있는가.
//
// 연대서명 개편 중 `GET /api/signatures`가 signatures[] 목록을 더 이상 싣지
// 않게 되면서, useHomeSignatureActivity의 recentSignatures가 setter 없는 빈
// 배열로 남았다. 그 아래 45줄짜리 토스트 effect는 `recentSignatures.length
// === 0`에서 즉시 return하므로 절대 실행되지 않고, HomeClient는 영원히
// false/null인 <HomeSocialProofToast>를 렌더했다 — 컴파일은 되지만 기능은
// 죽은 상태다. 같은 일이 다시 생기지 않게 공급원 연결을 고정한다.
// ---------------------------------------------------------------------------
const activitySource = read("src/components/home/useHomeSignatureActivity.ts");
assert(
  /import \{[^}]*\bfetchSignatureWall\b[^}]*\} from "@\/lib\/signatures\/client";/.test(
    activitySource,
  ),
  "useHomeSignatureActivity must import fetchSignatureWall from @/lib/signatures/client — that endpoint is the only remaining source of signer names for the home social-proof toast.",
);
assert(
  /fetchSignatureWall\(\)/.test(activitySource),
  "useHomeSignatureActivity must actually call fetchSignatureWall() — importing it without calling it leaves the toast inert.",
);
// setter 없는 useState는 "영원히 빈 배열"과 같은 말이다. 토스트가 읽는 상태에
// 반드시 setter가 있어야 하고, 그 setter가 실제로 호출돼야 한다.
const namesStateMatch = activitySource.match(
  /const \[(\w+),\s*(\w+)\] = useState<[^>]*>\(\[\]\)/,
);
assert(
  namesStateMatch,
  "useHomeSignatureActivity must hold the toast's name pool in a useState WITH a setter — `const [x] = useState([])` (no setter) is a permanently empty array, which is exactly the regression this check exists to catch.",
);
assert(
  new RegExp(`${namesStateMatch[2]}\\(`).test(activitySource),
  `useHomeSignatureActivity must call ${namesStateMatch[2]}(...) — a declared-but-never-called setter leaves the toast inert just the same.`,
);
assert(
  !/silently inert|compile-keeping shim|LegacyRecentSignature/.test(activitySource),
  "useHomeSignatureActivity must not keep the Task 5 compile-keeping shim (LegacyRecentSignature / \"silently inert\") — the hook is wired to fetchSignatureWall now.",
);
// 프라이버시 전제: 토스트에 뜨는 이름은 명단 벽과 같은 출처, 즉 이름 공개에
// 동의한 서명자뿐이다. 벽 쿼리가 그 필터를 잃으면 토스트도 함께 비동의자
// 이름을 띄우게 되므로 여기서 전제를 못박는다.
assert(
  /\.eq\("name_public",\s*true\)/.test(read("src/lib/signatures/api/wall.ts")),
  "src/lib/signatures/api/wall.ts must filter on .eq(\"name_public\", true) — the home toast reuses this endpoint, so this filter is what keeps non-consenting signers' names off the home page.",
);
assert(
  pageSource.includes("HomeSocialProofToast"),
  "HomeClient must render HomeSocialProofToast.",
);

console.log("Home page refactor checks passed.");
