import { readFileSync } from "node:fs";
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

// 조회 함수는 두 가지 형태로 선언된다: 평범한 `export async function`,
// 그리고 요청 단위 중복 제거를 위해 React.cache로 감싼 `export const X = cache(async`.
// 어느 쪽이든 본문을 집어낸다 — 이 검사의 관심사는 선언 방식이 아니라
// maybeSingle()을 쓰는지다.
function functionBody(source, name) {
  const markers = [
    `export async function ${name}`,
    `export const ${name} = cache(`,
  ];
  const marker = markers.find((candidate) => source.includes(candidate));
  assert(marker !== undefined, `${name} was not found.`);
  const start = source.indexOf(marker);
  const rest = source.slice(start + marker.length);
  const nextStarts = [
    rest.indexOf("\nexport async function "),
    rest.indexOf("\nexport const "),
  ].filter((index) => index >= 0);
  const end = nextStarts.length > 0 ? Math.min(...nextStarts) : rest.length;
  return marker + rest.slice(0, end);
}

const newsData = read("src/lib/data/news.ts");
const timelineData = read("src/lib/data/timeline.ts");

for (const name of ["getNewsBySlug", "getNewsById"]) {
  const body = functionBody(newsData, name);
  assert(
    body.includes(".maybeSingle()"),
    `${name} must use maybeSingle() so missing rows become 404/null instead of 500.`,
  );
  assert(
    !body.includes(".single()"),
    `${name} must not use single() for user-addressable detail lookups.`,
  );
}

const timelineById = functionBody(timelineData, "getTimelineById");
assert(
  timelineById.includes(".maybeSingle()"),
  "getTimelineById must use maybeSingle() so missing rows become 404/null instead of 500.",
);
assert(
  !timelineById.includes(".single()"),
  "getTimelineById must not use single() for user-addressable detail lookups.",
);

console.log("Not-found semantics checks passed.");
