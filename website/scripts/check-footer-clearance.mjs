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
  ["src/components/home/HomeClient.tsx", "md:py-20", "--color-deep-raised", "home.stats"],
  ["src/app/story/page.tsx", "md:py-28", "--color-forest", "story.cta"],
  ["src/app/en/page.tsx", "md:py-28", "--color-forest", "en.cta"],
];
for (const [file, pad, color, label] of DARK_TAILS) {
  const src = read(file);
  const re = new RegExp(`${pad}[^"]*bg-\\[var\\(${color.replace(/[-]/g, "-")}\\)\\]`);
  assert(re.test(src),
    `${file}: ${label} 밴드는 ${pad} + bg-[var(${color})] 를 유지해야 한다 — 패딩이 줄면 능선이 콘텐츠를 덮고, 색이 --color-deep 이 되면 푸터와 같아져 능선이 사라진다.`);
  assert(!new RegExp(`${pad}[^"]*bg-\\[var\\(--color-deep\\)\\]`).test(src),
    `${file}: ${label} 밴드가 푸터와 같은 --color-deep 이다 — --color-deep-raised 를 써라.`);
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
