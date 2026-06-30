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

const mainPath = "src/components/admin/AdminToolbarDialogs.tsx";
const modulePaths = [
  "src/components/admin/dialogs/useDialogA11y.ts",
  "src/components/admin/dialogs/AdminDialogFrame.tsx",
  "src/components/admin/dialogs/DiscardChangesDialog.tsx",
  "src/components/admin/dialogs/RevertKeyDialog.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 70,
  "AdminToolbarDialogs.tsx must stay a small dialog orchestrator.",
);

for (const required of ["DiscardChangesDialog", "RevertKeyDialog"]) {
  assert(mainSource.includes(required), `AdminToolbarDialogs.tsx must include ${required}.`);
}

for (const banned of [
  "useRef",
  "useEffect",
  "useCallback",
  'role="alertdialog"',
  "querySelectorAll",
]) {
  assert(!mainSource.includes(banned), `AdminToolbarDialogs.tsx must not own ${banned}.`);
}

const a11ySource = read("src/components/admin/dialogs/useDialogA11y.ts");
for (const required of ["useEscapeToClose", "useFocusTrap", "querySelectorAll", "keydown"]) {
  assert(a11ySource.includes(required), `useDialogA11y.ts must contain ${required}.`);
}

const frameSource = read("src/components/admin/dialogs/AdminDialogFrame.tsx");
for (const required of [
  'role="alertdialog"',
  "aria-modal",
  "useEscapeToClose",
  "useFocusTrap",
  "onBackdropClick",
]) {
  assert(frameSource.includes(required), `AdminDialogFrame.tsx must contain ${required}.`);
}

const discardSource = read("src/components/admin/dialogs/DiscardChangesDialog.tsx");
for (const required of ["편집 모드 종료", "저장 후 종료", "버리기", "AdminDialogFrame"]) {
  assert(discardSource.includes(required), `DiscardChangesDialog.tsx must contain ${required}.`);
}

const revertSource = read("src/components/admin/dialogs/RevertKeyDialog.tsx");
for (const required of ["기본값으로 복원", "selectedKey", "복원 중", "AdminDialogFrame"]) {
  assert(revertSource.includes(required), `RevertKeyDialog.tsx must contain ${required}.`);
}

console.log("Admin toolbar dialogs refactor checks passed.");
