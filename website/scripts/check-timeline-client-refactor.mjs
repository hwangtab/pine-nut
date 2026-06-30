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

const clientPaths = [
  "src/app/timeline/TimelineClient.tsx",
  "src/app/en/timeline/EnglishTimelineClient.tsx",
];
const componentPaths = [
  "src/components/timeline/timeline-config.ts",
  "src/components/timeline/TimelinePage.tsx",
  "src/components/timeline/TimelineYearFilter.tsx",
  "src/components/timeline/TimelineCard.tsx",
  "src/components/timeline/TimelineCta.tsx",
];

for (const componentPath of componentPaths) {
  assert(existsSync(join(root, componentPath)), `${componentPath} must exist.`);
}

for (const clientPath of clientPaths) {
  const source = read(clientPath);
  assert(
    source.trim().split(/\r?\n/).length <= 45,
    `${clientPath} must stay a thin locale adapter.`,
  );
  assert(source.includes("TimelinePage"), `${clientPath} must render TimelinePage.`);
  assert(source.includes("timelineConfig"), `${clientPath} must pass a locale timelineConfig.`);
  for (const banned of [
    "useState",
    "useRef",
    "useInView",
    "Image",
    "SubHero",
    "EditableText",
    "categoryColors",
    "filteredEvents",
  ]) {
    assert(!source.includes(banned), `${clientPath} must not duplicate ${banned}.`);
  }
}

const configSource = read("src/components/timeline/timeline-config.ts");
for (const required of [
  "koreanTimelineConfig",
  "englishTimelineConfig",
  "categoryStyles",
  "imageSourceLabel",
  "formatYear",
  "timeline.cta.href",
  "en.timeline.cta.href",
]) {
  assert(configSource.includes(required), `timeline-config.ts must contain ${required}.`);
}

const pageSource = read("src/components/timeline/TimelinePage.tsx");
for (const required of [
  "useState",
  "SubHero",
  "TimelineYearFilter",
  "TimelineCard",
  "TimelineCta",
  "filteredEvents",
]) {
  assert(pageSource.includes(required), `TimelinePage.tsx must contain ${required}.`);
}

const cardSource = read("src/components/timeline/TimelineCard.tsx");
for (const required of ["useInView", "Image", "imageSourceLabel", "categoryStyles"]) {
  assert(cardSource.includes(required), `TimelineCard.tsx must contain ${required}.`);
}

console.log("Timeline client refactor checks passed.");
