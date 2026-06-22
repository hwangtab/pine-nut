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

function functionBody(source, name) {
  const marker = `export async function ${name}`;
  const start = source.indexOf(marker);
  assert(start >= 0, `${name} was not found.`);
  const next = source.indexOf("\nexport async function ", start + marker.length);
  return source.slice(start, next >= 0 ? next : source.length);
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
