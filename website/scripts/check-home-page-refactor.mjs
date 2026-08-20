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

const impactSource = read("src/components/home/HomeImpactSection.tsx");
for (const expected of ["EditableList", "home.impact.cards", "gradients", "svgIcons"]) {
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

console.log("Home page refactor checks passed.");
