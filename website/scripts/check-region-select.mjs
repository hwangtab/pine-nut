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

const componentPath = "src/components/petition/RegionSelect.tsx";
assert(existsSync(join(root, componentPath)), `${componentPath} must exist.`);

const source = read(componentPath);

// --- 계약: regions.ts 산출물을 자체 구현하지 않고 그대로 소비한다 ---
assert(
  /import\s*\{[^}]*OVERSEAS_REGION[^}]*\}\s*from\s*["']@\/lib\/regions["']/.test(source),
  "RegionSelect must import OVERSEAS_REGION from @/lib/regions (not redefine it).",
);
assert(
  /import\s*\{[^}]*REGION_TOPS[^}]*\}\s*from\s*["']@\/lib\/regions["']/.test(source),
  "RegionSelect must import REGION_TOPS from @/lib/regions.",
);
assert(
  /import\s*\{[^}]*subsFor[^}]*\}\s*from\s*["']@\/lib\/regions["']/.test(source),
  "RegionSelect must import subsFor from @/lib/regions.",
);
assert(
  /import\s*\{[^}]*REGION_SUB_MAX_LENGTH[^}]*\}\s*from\s*["']@\/lib\/regions["']/.test(source),
  "RegionSelect must import REGION_SUB_MAX_LENGTH from @/lib/regions.",
);

// --- 계약: props 인터페이스가 Task 8이 소비할 정확한 모양이어야 한다 ---
assert(
  /export interface RegionSelectProps\s*\{/.test(source),
  "RegionSelect must export RegionSelectProps.",
);
for (const propPattern of [
  /top:\s*string;/,
  /sub:\s*string;/,
  /onTopChange\(value:\s*string\):\s*void;/,
  /onSubChange\(value:\s*string\):\s*void;/,
  /error\?:\s*string;/,
  /idPrefix:\s*string;/,
  /disabled\?:\s*boolean;/,
  /labels:\s*\{\s*top:\s*string;\s*sub:\s*string;\s*overseasPlaceholder:\s*string\s*\};/,
]) {
  assert(
    propPattern.test(source),
    `RegionSelectProps must declare ${propPattern}.`,
  );
}

// --- 계약: 시·도 변경 시 시·군·구를 실제로 초기화한다 (문자열 존재가 아니라 같은
// onChange 핸들러 안에서 두 호출이 함께 일어나는지 구조로 검증) ---
const topSelectBlockMatch = source.match(
  /<select[^>]*id=\{topId\}[\s\S]*?<\/select>/,
);
assert(topSelectBlockMatch, "Could not locate the top <select> block for structural checks.");
const topSelectBlock = topSelectBlockMatch[0];
assert(
  /onChange=\{\s*\(event\)\s*=>\s*\{[\s\S]*?onTopChange\(event\.target\.value\);[\s\S]*?onSubChange\(""\);[\s\S]*?\}\s*\}/.test(
    topSelectBlock,
  ),
  "Changing the top <select> must call onTopChange AND reset onSubChange(\"\") in the same handler — " +
    "otherwise a stale sub (e.g. 경기도+홍천군) survives a top change and fails isValidRegionPair server-side.",
);

// --- 계약: 해외는 subs를 빈 배열로 취급하고 자유 입력으로 전환한다 ---
assert(
  /const\s+isOverseas\s*=\s*top\s*===\s*OVERSEAS_REGION/.test(source),
  "RegionSelect must derive isOverseas from top === OVERSEAS_REGION (not a hardcoded string).",
);
assert(
  /const\s+subs\s*=\s*isOverseas\s*\?\s*\[\]\s*:\s*subsFor\(top\)/.test(source),
  "RegionSelect must compute subs as isOverseas ? [] : subsFor(top).",
);

const overseasInputMatch = source.match(/isOverseas\s*\?\s*\(([\s\S]*?)\)\s*:\s*\(/);
assert(overseasInputMatch, "Could not locate the isOverseas ternary branch for structural checks.");
const overseasBranch = overseasInputMatch[1];
assert(
  /type="text"/.test(overseasBranch) && /id=\{subId\}/.test(overseasBranch),
  "The overseas branch must render a text <input id={subId}>, not a <select>.",
);
assert(
  /maxLength=\{REGION_SUB_MAX_LENGTH\}/.test(overseasBranch),
  "The overseas free-text input must cap length via maxLength={REGION_SUB_MAX_LENGTH}, not a hardcoded number.",
);
assert(
  !/maxLength=\{4[0-9]\}|maxLength="40"|maxLength=\{40\}/.test(source),
  "RegionSelect must not hardcode the 40-char limit; it must come from REGION_SUB_MAX_LENGTH.",
);

// --- 계약: 세종특별자치시(subs가 빈 시·도)를 막지 않는다 — select를 required로 걸어
// 두면 고를 옵션이 없는데도 네이티브 검증이 걸릴 수 있으므로, 옵션이 있을 때만
// required가 걸려야 한다. ---
const subSelectBlockMatch = source.match(/<select[^>]*id=\{subId\}[\s\S]*?<\/select>/);
assert(subSelectBlockMatch, "Could not locate the sub <select> block for structural checks.");
const subSelectBlock = subSelectBlockMatch[0];
assert(
  !/id=\{subId\}[\s\S]{0,200}\brequired\b(?!=)/.test(subSelectBlock) ||
    /required=\{/.test(subSelectBlock),
  "The sub <select> must not hardcode `required` as a bare boolean — a 시·도 with zero subs " +
    "(세종특별자치시) has nothing to pick, so required must be a derived expression.",
);
assert(
  /disabled=\{[^}]*subHasOptions[^}]*\}|disabled=\{[^}]*subs\.length[^}]*\}/.test(subSelectBlock),
  "The sub <select> must factor subs having zero options into its disabled state, " +
    "so 세종특별자치시 (no 시·군·구) doesn't present a dead, misleadingly-enabled dropdown.",
);

// --- 접근성: label 연결 + aria-invalid + aria-describedby ---
for (const [id, labelFor] of [
  ["topId", "topId"],
  ["subId", "subId"],
]) {
  assert(
    new RegExp(`htmlFor=\\{${labelFor}\\}`).test(source),
    `RegionSelect must have a <label htmlFor={${id}}>.`,
  );
}
// aria-invalid/aria-describedby must be present on EACH of the three possible controls
// (top select, non-overseas sub select, overseas free-text input) individually — a global
// count across the whole file would still pass if only two of the three carried it,
// since the ternary keeps both sub-branches' markup in the source at once.
for (const [name, block] of [
  ["top <select>", topSelectBlock],
  ["non-overseas sub <select>", subSelectBlock],
  ["overseas free-text <input>", overseasBranch],
]) {
  assert(
    /aria-invalid=\{!!error\}/.test(block),
    `${name} must set aria-invalid={!!error}.`,
  );
  assert(
    /aria-describedby=\{error \? errorId : undefined\}/.test(block),
    `${name} must set aria-describedby={error ? errorId : undefined}.`,
  );
}
assert(
  /id=\{errorId\}[\s\S]{0,20}className="[^"]*"[\s\S]{0,20}role="alert"/.test(source),
  "The error message must render with id={errorId} and role=\"alert\".",
);

// --- 스타일 관례: 기존 폼 필드 클래스를 그대로 따른다 (--color-warm은 CTA 전용,
// 새 디자인 언어를 발명하지 않는다는 원칙 확인용 — paper-field 재사용 여부) ---
assert(
  (source.match(/className="paper-field/g) ?? []).length >= 3,
  "RegionSelect must reuse the existing .paper-field convention for all three inputs (top select, sub select, overseas input).",
);

console.log("RegionSelect component checks passed.");
