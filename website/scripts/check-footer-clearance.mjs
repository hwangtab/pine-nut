// 푸터 능선(RidgeDivider) 아래 여백 구조 가드.
//
// 능선은 푸터 위로 겹쳐 그려지므로(마루: 모바일 30px / sm 42px / md 60px),
// 마지막 콘텐츠 아래에 그만큼 + 숨 쉴 틈이 필요하다. 이 여백을 페이지가
// 각자 pb-* 로 잡던 방식은 세 번 어긋났고(가림 → 과다 공백 → 다시 가림),
// 관리자가 추가한 섹션에는 손댈 개발자가 없어 구조적으로 재발한다.
//
// 그래서 여백은 PublicShell이 전역으로 한 번만 확보한다. 이 스크립트는
// 그 구조가 유지되는지, 그리고 페이지들이 다시 각자 여백을 잡기 시작하지
// 않는지 검사한다.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = fileURLToPath(new URL("..", import.meta.url));
const fail = [];
function assert(cond, msg) { if (!cond) fail.push(msg); }
const read = (p) => readFileSync(join(root, p), "utf8");

// 1) 전역 여백이 PublicShell에 살아 있어야 한다.
const shell = read("src/components/PublicShell.tsx");
assert(shell.includes("needsFooterRidgeGap"),
  "PublicShell must import/use needsFooterRidgeGap — 전역 능선 여백 판정이 사라졌다.");
assert(shell.includes("footer-ridge-gap"),
  "PublicShell must put the footer-ridge-gap class on <main> — 여백은 마지막 블록 안쪽 패딩으로 준다.");
const css = read("src/app/globals.css");
assert(css.includes(".footer-ridge-gap > :last-child"),
  "globals.css must define .footer-ridge-gap > :last-child — 별도 여백 요소는 배경 이음매를 만든다.");
assert(shell.includes("<CustomSectionsHost />"),
  "PublicShell must render CustomSectionsHost before the spacer — 관리자 섹션도 여백을 받아야 한다.");


// 2) 능선은 여백이 있는 페이지에서만 그려져야 한다.
const footer = read("src/components/Footer.tsx");
assert(!/showRidge/.test(footer),
  "Footer 의 능선 토글은 제거됐다 — 푸터와 같은 색으로 끝나는 페이지가 없으므로 능선은 전 라우트 공통이다.");
assert(!shell.includes("showRidge"),
  "능선 토글은 제거됐다 — 푸터와 같은 색으로 끝나는 페이지가 없으므로 능선은 전 라우트 공통이다.");

// 3) 라우트 분류가 남아 있어야 한다.
const nav = read("src/lib/nav-routes.ts");
for (const sym of ["DARK_TAIL_ROUTES", "needsFooterRidgeGap"]) {
  assert(nav.includes(sym), `nav-routes.ts must define ${sym}.`);
}

// 5) 관리자 섹션이 붙으면 어두운 꼬리 라우트라도 여백을 강제해야 한다.
assert(shell.includes("hasCustomTail"),
  "PublicShell must force the spacer when admin custom sections exist — 어두운 꼬리 라우트에 섹션이 붙으면 꼬리가 밝아진다.");
assert(shell.includes("PATH_TO_BUILDER_PAGE"),
  "PublicShell must use the shared PATH_TO_BUILDER_PAGE so its judgement matches CustomSectionsHost.");
const host = read("src/components/CustomSectionsHost.tsx");
assert(host.includes("PATH_TO_BUILDER_PAGE"),
  "CustomSectionsHost must use the shared PATH_TO_BUILDER_PAGE — 두 곳이 다른 맵을 보면 판정이 어긋난다.");

// 4) 페이지가 다시 각자 푸터 여백을 잡지 않아야 한다.
//    (md: 로 커지는 큰 하단 패딩은 이 구조에서 전역 여백과 겹쳐 과다 공백이 된다)
const OFFENDER = /\bmd:pb-(2[0-9]|3[0-9]|4[0-9])\b/;
const SKIP = ["src/app/admin", "src/components/admin"];
function walk(dir, out = []) {
  for (const e of readdirSync(join(root, dir))) {
    const rel = `${dir}/${e}`;
    if (SKIP.some((s) => rel.startsWith(s))) continue;
    if (statSync(join(root, rel)).isDirectory()) walk(rel, out);
    else if (rel.endsWith(".tsx")) out.push(rel);
  }
  return out;
}
// 히어로(화면 상단 풀블리드 블록)의 하단 패딩은 푸터와 무관하므로 제외한다.
const HERO_EXEMPT = [
  "src/components/SubHero.tsx",
  "src/components/UtilityHeader.tsx",
  "src/components/home/HomeClient.tsx",
  "src/components/PublicShell.tsx",
];
for (const f of walk("src")) {
  if (HERO_EXEMPT.includes(f)) continue;
  const src = read(f);
  for (const [i, line] of src.split("\n").entries()) {
    if (OFFENDER.test(line)) {
      fail.push(`${f}:${i + 1} — 페이지가 자체 하단 여백(md:pb-*)을 잡고 있다. 푸터 여백은 PublicShell이 전역으로 확보한다.`);
    }
  }
}

// ── 색 이음매 재발 방지 ──────────────────────────────────────────────────────
// 1) DARK_TAIL 라우트는 전역 여백을 받지 않는다. 그 밴드가 자기 하단 패딩으로
//    능선 마루(md 60px)를 비워야 하고, 색은 푸터(--color-deep)와 달라야 한다.
//    같은 색이면 경계가 사라져 능선이 보이지 않는다.
const DARK_TAILS = [
  ["src/components/home/HomeClient.tsx", "--color-deep-raised", "home.stats"],
  ["src/app/story/page.tsx", "--color-forest", "story.cta"],
  ["src/app/en/page.tsx", "--color-forest", "en.cta"],
  ["src/app/concert/before-cut/page.tsx", "--color-deep-raised", "before-cut 마무리 CTA"],
  ["src/app/concert/village-feast/page.tsx", "--color-deep-raised", "village-feast 마무리 CTA"],
];
for (const [file, color, label] of DARK_TAILS) {
  const lines = read(file).split("\n");
  const band = lines.filter((line) => line.includes(`bg-[var(${color})]`));
  assert(band.some((line) => line.includes("ridge-tail")),
    `${file}: ${label} 밴드에 .ridge-tail 이 있어야 한다 — 어두운 꼬리는 자기 색으로 능선 마루를 비운다.`);
  // 세로 패딩은 .ridge-tail 이 전부 정한다. pt-*/py-* 를 함께 쓰면 Tailwind
  // 유틸리티가 이겨서 위아래 대칭(아래 = 위 + 마루)이 깨진다.
  assert(!band.some((line) => /\bridge-tail\b/.test(line) && /\b(sm:|md:)?p[ytb]-\d/.test(line)),
    `${file}: ${label} 밴드가 .ridge-tail 과 pt-*/py-*/pb-* 를 함께 쓴다 — 세로 패딩은 .ridge-tail 에 맡겨라.`);
  assert(!lines.some((line) => line.includes("bg-[var(--color-deep)]") && line.includes("ridge-tail")),
    `${file}: ${label} 밴드가 푸터와 같은 --color-deep 이다 — --color-deep-raised 를 써라.`);
}

// 여백 값은 능선 높이에서 유도한다. 손으로 고른 숫자로 되돌아가면 능선과 무관해져
// 어떤 페이지는 잘리고 어떤 페이지는 허옇게 뜬다.
assert(css.includes("--ridge-crest") && css.includes("--ridge-breathe"),
  "globals.css must define --ridge-crest/--ridge-breathe — 여백 값은 능선 높이에서 유도한다.");
assert(css.includes("--ridge-band-pad"),
  "globals.css must define --ridge-band-pad — 어두운 밴드의 세로 패딩도 한 곳에서 온다.");
// 밴드의 아래 여백은 '위 + 마루' 여야 눈에 보이는 여백이 위아래 같아진다.
assert(/\.ridge-tail \{[^}]*padding-top: var\(--ridge-band-pad\);[^}]*padding-bottom: calc\(var\(--ridge-band-pad\) \+ var\(--ridge-crest\)\)/.test(css),
  ".ridge-tail 의 아래 여백은 calc(--ridge-band-pad + --ridge-crest) 여야 한다 — 마루가 먹는 만큼을 더하지 않으면 아래가 좁아 보인다.");
assert(/\.footer-ridge-gap > :last-child \{[^}]*calc\(var\(--ridge-crest\) \+ var\(--ridge-breathe\)\)/.test(css),
  ".footer-ridge-gap 의 여백도 마루 높이에서 유도해야 한다.");

// ── 새로 만든 페이지도 잡는다 ────────────────────────────────────────────────
// 위 DARK_TAILS 는 '아는 파일'만 본다. 정작 이 버그가 매번 들어온 경로는
// '어두운 밴드로 끝나는 페이지를 새로 만들면서 등록을 잊는 것'이었다.
// 그래서 목록이 아니라 소스에서 유도한다: 페이지 파일에서 배경색을 칠하는
// 마지막 클래스가 어두운 색이면 그 줄에 .ridge-tail 이 있어야 한다.
const DARK_BG = /bg-\[var\(--color-(deep|deep-raised|forest)\)\](?!\/)/;
const ANY_BG = /bg-\[var\(--color-[a-z-]+\)\](?!\/)/;
// 페이지의 마지막 섹션을 담는 파일들. 컴포넌트(Footer 등)는 페이지 꼬리가
// 아니므로 제외한다.
const PAGE_FILES = walk("src/app")
  .filter((f) => f.endsWith("/page.tsx"))
  .filter((f) => !f.startsWith("src/app/admin") && !f.startsWith("src/app/api"))
  .concat(["src/components/home/HomeClient.tsx"]);

// 버튼·칩도 배경색을 갖는다. 섹션급 배경만 본다 — 둥근 모서리나 inline-flex
// 가 붙어 있으면 그건 페이지 꼬리가 아니라 그 안의 버튼이다.
const NOT_A_SECTION = /rounded|inline-flex|<Link|<a\s|<button|letter-btn|min-h-\[44px\]/;

for (const f of PAGE_FILES) {
  const lines = read(f).split("\n");
  let lastBgLine = null;
  for (const [i, line] of lines.entries()) {
    if (NOT_A_SECTION.test(line)) continue;
    if (ANY_BG.test(line)) lastBgLine = { i, line };
  }
  if (!lastBgLine || !DARK_BG.test(lastBgLine.line)) continue;
  assert(lastBgLine.line.includes("ridge-tail"),
    `${f}:${lastBgLine.i + 1} — 어두운 밴드로 끝나는 페이지다. 그 밴드에 .ridge-tail 을 붙이고, 라우트를 nav-routes.ts 의 DARK_TAIL_ROUTES 에 등록해라. 안 하면 여백이 배경 없는 래퍼에 붙어 크림색 띠가 생긴다.`);

  // 라우트도 등록돼 있어야 한다 — 등록을 잊으면 전역 여백이 걸려 이음매가 생긴다.
  if (f.endsWith("/page.tsx") && f.startsWith("src/app/")) {
    const route = "/" + f.slice("src/app/".length, -"/page.tsx".length);
    const normalized = route === "/" ? "/" : route.replace(/\/$/, "");
    if (!normalized.includes("[")) {
      assert(nav.includes(`"${normalized}"`),
        `${f} — 어두운 밴드로 끝나는데 nav-routes.ts 의 DARK_TAIL_ROUTES 에 "${normalized}" 가 없다.`);
    }
  }
}

// 2) 섹션 배경 그라디언트가 한쪽 끝에서 불투명하게 끝나면 그 경계에 가로 색선이
//    생긴다. 모래빛 그라디언트는 양끝이 모두 투명해야 한다.
for (const file of [
  "src/components/timeline/TimelineCta.tsx",
  "src/app/gallery/page.tsx",
  "src/app/en/gallery/page.tsx",
]) {
  const src = read(file);
  assert(!/gradient-to-[tb] from-\[var\(--color-bg-warm\)\] to-transparent/.test(src),
    `${file}: 한쪽 끝이 불투명한 모래빛 그라디언트 — from-transparent via-... to-transparent 를 써라.`);
}

if (fail.length) {
  console.error("footer-clearance:check 실패\n" + fail.map((m) => "  - " + m).join("\n"));
  process.exit(1);
}

console.log("footer-clearance:check ok");
