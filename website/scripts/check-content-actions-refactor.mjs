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
  "src/lib/actions/news/types.ts",
  "src/lib/actions/news/form.ts",
  "src/lib/actions/news/audit-row.ts",
  "src/lib/actions/news/revalidation.ts",
  "src/lib/actions/news/mutations.ts",
  "src/lib/actions/timeline/types.ts",
  "src/lib/actions/timeline/form.ts",
  "src/lib/actions/timeline/audit-row.ts",
  "src/lib/actions/timeline/revalidation.ts",
  "src/lib/actions/timeline/mutations.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

for (const [entryPath, mutationPath, domain, maxLines] of [
  ["src/lib/actions/news.ts", "src/lib/actions/news/mutations.ts", "news", 260],
  [
    "src/lib/actions/timeline.ts",
    "src/lib/actions/timeline/mutations.ts",
    "timeline",
    280,
  ],
]) {
  const entrySource = read(entryPath);
  assert(
    entrySource.includes(`@/lib/actions/${domain}/mutations`),
    `${entryPath} must import ${domain} mutations.`,
  );

  const source = read(mutationPath);
  for (const expected of [
    `@/lib/actions/${domain}/form`,
    `@/lib/actions/${domain}/audit-row`,
    `@/lib/actions/${domain}/revalidation`,
  ]) {
    assert(source.includes(expected), `${mutationPath} must import ${expected}.`);
  }

  for (const removedResponsibility of [
    "interface Validated",
    "interface NewsAuditRow",
    "interface TimelineAuditRow",
    "function validate",
    "function friendlyError",
    "function revalidate",
    "function parse",
    "function get",
    "const NEWS_CATEGORIES",
    "const TIMELINE_CATEGORIES",
  ]) {
    assert(!source.includes(removedResponsibility), `${mutationPath} should not own ${removedResponsibility}.`);
  }

  const lineCount = source.trimEnd().split("\n").length;
  assert(lineCount <= maxLines, `${mutationPath} should stay action-focused, got ${lineCount} lines.`);
}

const newsFormSource = read("src/lib/actions/news/form.ts");
for (const expected of ["NEWS_CATEGORIES", "validateNewsForm", "friendlyNewsError", "resolveThumbnailUrl"]) {
  assert(newsFormSource.includes(expected), `news form module must include ${expected}.`);
}

const newsAuditSource = read("src/lib/actions/news/audit-row.ts");
for (const expected of ["NewsAuditRow", "getNewsAuditRow", "parseNewsAuditRow", "NEWS_AUDIT_SELECT"]) {
  assert(newsAuditSource.includes(expected), `news audit module must include ${expected}.`);
}

const timelineFormSource = read("src/lib/actions/timeline/form.ts");
for (const expected of ["TIMELINE_CATEGORIES", "validateTimelineForm", "friendlyTimelineError", "extractYearFromDate"]) {
  assert(timelineFormSource.includes(expected), `timeline form module must include ${expected}.`);
}

const timelineAuditSource = read("src/lib/actions/timeline/audit-row.ts");
for (const expected of ["TimelineAuditRow", "getTimelineAuditRow", "parseTimelineAuditRow", "TIMELINE_AUDIT_SELECT"]) {
  assert(timelineAuditSource.includes(expected), `timeline audit module must include ${expected}.`);
}

console.log("Content actions refactor checks passed.");
