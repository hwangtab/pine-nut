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

const mainPath = "src/components/admin/VersionHistoryManager.tsx";
const modulePaths = [
  "src/components/admin/history/types.ts",
  "src/components/admin/history/summarize-payload.ts",
  "src/components/admin/history/useVersionHistoryManager.ts",
  "src/components/admin/history/VersionHistoryHeader.tsx",
  "src/components/admin/history/VersionHistoryFilterPanel.tsx",
  "src/components/admin/history/VersionHistoryStatus.tsx",
  "src/components/admin/history/VersionHistoryList.tsx",
  "src/components/admin/history/VersionHistoryEntryCard.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 65,
  "VersionHistoryManager.tsx must stay a small orchestration component.",
);

for (const required of [
  "useVersionHistoryManager",
  "VersionHistoryHeader",
  "VersionHistoryFilterPanel",
  "VersionHistoryStatus",
  "VersionHistoryList",
]) {
  assert(mainSource.includes(required), `VersionHistoryManager.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "useTransition",
  "useRouter",
  "summarizePayload",
  "window.confirm",
  "restorePageContentVersionAction",
  "restoreNewsVersionAction",
  "restoreTimelineVersionAction",
  "filteredEntries.map",
]) {
  assert(!mainSource.includes(banned), `VersionHistoryManager.tsx must not own ${banned}.`);
}

const summarySource = read("src/components/admin/history/summarize-payload.ts");
for (const required of [
  "summarizePayload",
  "page_content",
  "bulk_update",
  "timeline_events",
  "소식 항목",
]) {
  assert(summarySource.includes(required), `summarize-payload.ts must contain ${required}.`);
}

const hookSource = read("src/components/admin/history/useVersionHistoryManager.ts");
for (const required of [
  "useRouter",
  "useTransition",
  "restorePageContentVersionAction",
  "restoreNewsVersionAction",
  "restoreTimelineVersionAction",
  "filteredEntries",
  "handleRestore",
]) {
  assert(hookSource.includes(required), `useVersionHistoryManager.ts must contain ${required}.`);
}

const filterSource = read("src/components/admin/history/VersionHistoryFilterPanel.tsx");
for (const required of ["page_content", "timeline_events", "setFilter", "복원 전에 공개 페이지"]) {
  assert(filterSource.includes(required), `VersionHistoryFilterPanel.tsx must contain ${required}.`);
}

const cardSource = read("src/components/admin/history/VersionHistoryEntryCard.tsx");
for (const required of [
  "summarizePayload",
  "isRestorable",
  "handleRestore",
  "Intl.DateTimeFormat",
  "이 버전 복원",
]) {
  assert(cardSource.includes(required), `VersionHistoryEntryCard.tsx must contain ${required}.`);
}

console.log("Version history refactor checks passed.");
