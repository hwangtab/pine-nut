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

const regionsPath = "src/lib/regions.ts";
assert(existsSync(join(root, regionsPath)), `${regionsPath} must exist.`);

const source = read(regionsPath);

for (const required of [
  'export const OVERSEAS_REGION = "해외"',
  "export const REGION_SUB_MAX_LENGTH = 40",
  "export interface RegionOption",
  "export const REGIONS: RegionOption[]",
  "export const REGION_TOPS: string[]",
  "export function subsFor(top: string): string[]",
  "export function isValidRegionPair(top: string, sub: string): boolean",
]) {
  assert(source.includes(required), `regions.ts must contain: ${required}`);
}

for (const banned of ["labelEn", "subsEn", "key:", "LocaleCode"]) {
  assert(!source.includes(banned), `regions.ts must not carry English/legacy fields: found ${banned}`);
}

const topMatches = source.match(/top:\s*"[^"]+"/g) ?? [];
assert(
  topMatches.length === 18,
  `REGIONS must contain 17 시·도 + 해외 (18 top entries), found ${topMatches.length}`,
);

const REQUIRED_TOPS = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시",
  "울산광역시", "세종특별자치시", "경기도", "강원특별자치도", "충청북도", "충청남도",
  "전북특별자치도", "전라남도", "경상북도", "경상남도", "제주특별자치도", "해외",
];
for (const top of REQUIRED_TOPS) {
  assert(source.includes(`top: "${top}"`), `REGIONS must include top: "${top}"`);
}

assert(
  /top:\s*"해외",\s*subs:\s*\[\s*\]/.test(source),
  '"해외" entry must have an empty subs array — sub는 자유 입력으로 검증한다.',
);
assert(
  /top:\s*"세종특별자치시"[\s\S]{0,60}subs:\s*\[\s*\]/.test(source),
  '"세종특별자치시" entry must have an empty subs array (시·군·구 없음).',
);

assert(
  !/trimmedSub\.length\s*<=\s*40/.test(source),
  "isValidRegionPair must use REGION_SUB_MAX_LENGTH instead of a hardcoded 40.",
);

const packageJson = read("package.json");
assert(
  packageJson.includes('"regions:check"'),
  "package.json must expose regions:check.",
);

console.log("Regions data checks passed.");
