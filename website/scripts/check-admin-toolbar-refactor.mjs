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

const mainPath = "src/components/admin/AdminToolbar.tsx";
const modulePaths = [
  "src/components/admin/toolbar/useAdminToolbar.ts",
  "src/components/admin/toolbar/AdminToolbarMain.tsx",
  "src/components/admin/toolbar/AdminToolbarNotice.tsx",
  "src/components/admin/toolbar/AdminToolbarToast.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 75,
  "AdminToolbar.tsx must stay a small orchestration component.",
);

for (const required of [
  "useAdminToolbar",
  "AdminToolbarMain",
  "AdminToolbarNotice",
  "AdminToolbarToast",
  "AdminToolbarDialogs",
]) {
  assert(mainSource.includes(required), `AdminToolbar.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "useAdminEdit",
  "<svg",
  "setShowConfirm",
  "hasOverride(",
  "setTimeout(",
]) {
  assert(!mainSource.includes(banned), `AdminToolbar.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/admin/toolbar/useAdminToolbar.ts");
for (const required of [
  "useAdminEdit",
  "showConfirmDiscard",
  "showConfirmRevert",
  "handleToggleEditMode",
  "handleSaveAndExit",
  "handleDiscardAndExit",
  "handleConfirmRevert",
  "selectedKeyHasOverride",
]) {
  assert(hookSource.includes(required), `useAdminToolbar.ts must contain ${required}.`);
}

const toolbarSource = read("src/components/admin/toolbar/AdminToolbarMain.tsx");
for (const required of [
  "Pencil",
  "handleToggleEditMode",
  "selectedKeyHasOverride",
  "사이트 빌더",
  "히스토리",
  "관리자",
]) {
  assert(toolbarSource.includes(required), `AdminToolbarMain.tsx must contain ${required}.`);
}
assert(!toolbarSource.includes("<svg"), "AdminToolbarMain must use lucide icons instead of inline SVG.");

const noticeSource = read("src/components/admin/toolbar/AdminToolbarNotice.tsx");
assert(
  noticeSource.includes("인라인 편집") && noticeSource.includes("사이트 빌더"),
  "AdminToolbarNotice must contain the edit-mode guidance copy.",
);

const toastSource = read("src/components/admin/toolbar/AdminToolbarToast.tsx");
assert(
  toastSource.includes("saveError"),
  "AdminToolbarToast must render saveError.",
);

console.log("AdminToolbar refactor checks passed.");
