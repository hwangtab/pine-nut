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
  "src/lib/actions/news/mutations.ts",
  "src/lib/actions/timeline/mutations.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

for (const [entryPath, domain, expectedHelpers] of [
  [
    "src/lib/actions/news.ts",
    "news",
    ["createNews", "updateNews", "deleteNews", "restoreNews", "restoreNewsVersion"],
  ],
  [
    "src/lib/actions/timeline.ts",
    "timeline",
    [
      "createTimeline",
      "updateTimeline",
      "deleteTimeline",
      "restoreTimeline",
      "restoreTimelineVersion",
    ],
  ],
]) {
  const source = read(entryPath);
  assert(source.includes(`@/lib/actions/${domain}/mutations`), `${entryPath} must import ${domain} mutations.`);
  for (const expected of expectedHelpers) {
    assert(source.includes(expected), `${entryPath} must delegate ${expected}.`);
  }

  for (const removedResponsibility of [
    "redirect",
    "uploadImageFromFormData",
    "logAudit",
    "getAuthenticatedActionClient",
    ".from(",
    ".insert(",
    ".update(",
    ".upsert(",
  ]) {
    assert(!source.includes(removedResponsibility), `${entryPath} should not own ${removedResponsibility}.`);
  }

  const lineCount = source.trimEnd().split("\n").length;
  assert(lineCount <= 45, `${entryPath} should stay server-action-entrypoint focused, got ${lineCount} lines.`);
}

const newsMutations = read("src/lib/actions/news/mutations.ts");
for (const expected of [
  "uploadImageFromFormData",
  "validateNewsForm",
  "NEWS_AUDIT_SELECT",
  "logAudit",
  "revalidateNewsPaths",
  "redirect",
]) {
  assert(newsMutations.includes(expected), `news mutations must own ${expected}.`);
}

const timelineMutations = read("src/lib/actions/timeline/mutations.ts");
for (const expected of [
  "uploadImageFromFormData",
  "validateTimelineForm",
  "TIMELINE_AUDIT_SELECT",
  "logAudit",
  "revalidateTimelinePaths",
  "redirect",
]) {
  assert(timelineMutations.includes(expected), `timeline mutations must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"content-action-entrypoints:refactor:check"'),
  "package.json must expose content-action-entrypoints:refactor:check.",
);

console.log("Content action entrypoint refactor checks passed.");
