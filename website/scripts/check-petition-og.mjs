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

const ogImagePath = "src/app/petition/opengraph-image.tsx";
const layoutPath = "src/app/petition/layout.tsx";
const enLayoutPath = "src/app/en/petition/layout.tsx";
const statementDataPath = "src/components/petition/copy/statement.ts";

for (const p of [ogImagePath, layoutPath, enLayoutPath, statementDataPath]) {
  assert(existsSync(join(root, p)), `${p} must exist.`);
}

const ogImageSource = read(ogImagePath);
const layoutSource = read(layoutPath);
const enLayoutSource = read(enLayoutPath);
const statementSource = read(statementDataPath);

// ── The OG image route must exist and be a real edge image route, not just a
// file that happens to be named right — assert the Next.js file-convention
// contract it must satisfy to actually be picked up as /petition's og:image.
assert(/export const runtime\s*=\s*["']edge["']/.test(ogImageSource), `${ogImagePath} must export runtime = "edge".`);
assert(
  /width:\s*1200/.test(ogImageSource) && /height:\s*630/.test(ogImageSource),
  `${ogImagePath} must declare size 1200x630 (the standard OG image dimensions).`,
);
assert(/export const contentType\s*=\s*["']image\/png["']/.test(ogImageSource), `${ogImagePath} must export contentType = "image/png".`);
assert(
  /export default async function Image/.test(ogImageSource),
  `${ogImagePath} must default-export an async Image() function (the next/og file convention).`,
);

// ── The known trap this pattern has: satori silently drops Korean glyphs
// with no font supplied. The image must load a Korean font subset and must
// not let a font-loading failure crash image generation (fonts stays
// optional — `fonts.length > 0 ? { fonts } : {}`).
assert(
  /loadKoreanFont/.test(ogImageSource),
  `${ogImagePath} must load a Korean font subset (see src/app/opengraph-image.tsx's loadKoreanFont) — without it, Hangul renders as a blank card.`,
);
assert(
  /catch\s*\{\s*return null;\s*\}/.test(ogImageSource),
  `${ogImagePath}'s font loader must fail closed to null (not throw) so a font-fetch failure doesn't break image generation.`,
);
assert(
  /fonts\.length > 0 \? \{ fonts \} : \{\}/.test(ogImageSource),
  `${ogImagePath} must make the fonts option conditional on fonts.length > 0, so ImageResponse still renders (Latin-only) if the Korean font failed to load.`,
);

// ── Facts that must appear on the card, anchored with unit/context so a
// coincidental bare-number match elsewhere can't produce a false pass (the
// same discipline as check-petition-statement.mjs).
const cardFactAnchors = [
  [/111,999/, "사라질 나무 111,999그루"],
  [/51가구/, "물에 잠기는 51가구"],
  [/8년/, "지켜온 8년"],
];
for (const [pattern, label] of cardFactAnchors) {
  assert(pattern.test(ogImageSource), `${ogImagePath} is missing the required fact: ${label}.`);
}

// ── The closing line must be quoted verbatim from the statement's own data
// module (copy/statement.ts), the same anti-drift discipline
// check-petition-statement.mjs applies to the consent checkbox's quotation.
const closingMatch = statementSource.match(
  /key:\s*"petition\.statement\.closing\.p2",\s*defaultValue:\s*"([^"]+)"/,
);
assert(closingMatch, `${statementDataPath} must still export petition.statement.closing.p2 as a quoted string.`);
assert(
  ogImageSource.includes(closingMatch[1]),
  `${ogImagePath} must quote the statement's closing line verbatim from ${statementDataPath}: "${closingMatch[1]}".`,
);

// ── Signature counts/goals must never be baked into the OG image. Social
// platforms cache images aggressively, so a stale count would outlive the
// truth for days — worse than showing no number at all.
assert(
  !/SIGNATURE_GOAL/.test(ogImageSource),
  `${ogImagePath} must not import or render SIGNATURE_GOAL — cached social images would go stale.`,
);
assert(
  !/summary\.count|signatureCount/.test(ogImageSource),
  `${ogImagePath} must not render a live signature count — cached social images would go stale.`,
);

// ── petition/layout.tsx: openGraph.url must point at /petition specifically.
// The root layout's own comment warns that omitting a per-page og:url makes
// every child page's share link collapse onto the home page.
const layoutOgUrlMatch = layoutSource.match(/openGraph:\s*\{[\s\S]*?\burl:\s*["']([^"']+)["']/);
assert(layoutOgUrlMatch, `${layoutPath} must declare openGraph.url.`);
assert(
  layoutOgUrlMatch[1] === "/petition",
  `${layoutPath}'s openGraph.url must be "/petition", found "${layoutOgUrlMatch[1]}".`,
);

// ── twitter.card must be summary_large_image (not the default small
// "summary" card, which would crop this card's dense layout).
const twitterCardMatch = layoutSource.match(/twitter:\s*\{[\s\S]*?\bcard:\s*["']([^"']+)["']/);
assert(twitterCardMatch, `${layoutPath} must declare twitter.card.`);
assert(
  twitterCardMatch[1] === "summary_large_image",
  `${layoutPath}'s twitter.card must be "summary_large_image", found "${twitterCardMatch[1]}".`,
);

// ── SERP title/description (top-level `title`/`description`) must differ
// from the social title/description (openGraph.title/description) — they
// serve different readers (a search results list vs. a shared chat message)
// and collapsing them into one string was the exact complaint this guard
// exists to prevent from regressing.
//
// metadata 객체 중 openGraph 블록 "이전"만 최상위 필드 영역으로 본다 — 그
// 아래로 검색을 흘려보내면 openGraph.title 같은 중첩 필드를 최상위 title로
// 잘못 집어올 수 있다(실제로 이 가드를 짜는 중에 그 버그가 났다).
const metadataStart = layoutSource.indexOf("export const metadata");
assert(metadataStart !== -1, `${layoutPath} must export const metadata.`);
const topLevelRegion = layoutSource.slice(metadataStart, layoutSource.indexOf("openGraph:", metadataStart));

function extractTopLevelString(region, field) {
  // Matches `field: SOME_CONST` and resolves SOME_CONST via a `const NAME = "..."`
  // declaration in the same file, OR a direct string literal.
  const refMatch = region.match(new RegExp(`^\\s*${field}:\\s*([A-Z_][A-Za-z0-9_]*),`, "m"));
  if (refMatch) {
    const constMatch = layoutSource.match(new RegExp(`const ${refMatch[1]}\\s*=\\s*"([^"]+)"`));
    assert(constMatch, `${layoutPath} references \`${refMatch[1]}\` for ${field} but no matching const string was found.`);
    return constMatch[1];
  }
  const literalMatch = region.match(new RegExp(`^\\s*${field}:\\s*"([^"]+)"`, "m"));
  assert(literalMatch, `${layoutPath} must declare a resolvable top-level ${field}.`);
  return literalMatch[1];
}

const serpTitle = extractTopLevelString(topLevelRegion, "title");
const serpDescription = extractTopLevelString(topLevelRegion, "description");
const ogTitleMatch = layoutSource.match(/openGraph:\s*\{\s*title:\s*([A-Z_][A-Za-z0-9_]*)/);
assert(ogTitleMatch, `${layoutPath} must declare openGraph.title.`);
const ogTitleConst = layoutSource.match(new RegExp(`const ${ogTitleMatch[1]}\\s*=\\s*"([^"]+)"`));
assert(ogTitleConst, `${layoutPath}'s openGraph.title must resolve to a const string.`);
const socialTitle = ogTitleConst[1];

assert(
  serpTitle !== socialTitle,
  `${layoutPath}: SERP title and social (openGraph) title must differ — search intent and social hook serve different readers.`,
);

// ── SERP title should lead with searchable keywords (지역+쟁점), not the
// campaign slogan — "우리가 나무다" is not something anyone searches for.
assert(
  /홍천/.test(serpTitle) && /양수발전소/.test(serpTitle),
  `${layoutPath}'s SERP title must mention "홍천" and "양수발전소" — the actual search terms, per the region/issue-first requirement.`,
);

// ── Korean SERP titles truncate around ~30 characters in Google/Naver
// results; keep meaningful margin so the brand suffix isn't cut off.
assert(
  serpTitle.length <= 34,
  `${layoutPath}'s SERP title is ${serpTitle.length} chars — Korean SERP titles truncate around ~30 chars, keep it under 34.`,
);
assert(
  serpDescription.length <= 90,
  `${layoutPath}'s SERP description is ${serpDescription.length} chars — Korean SERP descriptions truncate around ~80 chars, keep it under 90.`,
);

// ── en/petition/layout.tsx must have the same shape: its own openGraph.url
// (not inherited from /en), and it must reuse the Korean petition's OG image
// route rather than fabricate a new English-only image file.
assert(/openGraph:\s*\{/.test(enLayoutSource), `${enLayoutPath} must declare its own openGraph block.`);
const enOgUrlMatch = enLayoutSource.match(/openGraph:\s*\{[\s\S]*?\burl:\s*["']([^"']+)["']/);
assert(enOgUrlMatch, `${enLayoutPath} must declare openGraph.url.`);
assert(
  enOgUrlMatch[1] === "/en/petition",
  `${enLayoutPath}'s openGraph.url must be "/en/petition", found "${enOgUrlMatch[1]}".`,
);
assert(
  enLayoutSource.includes("/petition/opengraph-image"),
  `${enLayoutPath} must reuse the Korean petition's OG image route (no new English-only OG image file was authorized).`,
);
assert(
  !existsSync(join(root, "src/app/en/petition/opengraph-image.tsx")),
  "src/app/en/petition/opengraph-image.tsx must not exist — a dedicated English OG image was explicitly out of scope.",
);
const enTwitterCardMatch = enLayoutSource.match(/twitter:\s*\{[\s\S]*?\bcard:\s*["']([^"']+)["']/);
assert(enTwitterCardMatch, `${enLayoutPath} must declare twitter.card.`);
assert(
  enTwitterCardMatch[1] === "summary_large_image",
  `${enLayoutPath}'s twitter.card must be "summary_large_image", found "${enTwitterCardMatch[1]}".`,
);

console.log("Petition OG/social metadata checks passed.");
