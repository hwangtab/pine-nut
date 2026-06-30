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
  "src/lib/contexts/admin-edit/types.ts",
  "src/lib/contexts/admin-edit/content-store.ts",
  "src/lib/contexts/admin-edit/useEditableSelection.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const contextSource = read("src/lib/contexts/AdminEditContext.tsx");
for (const expected of [
  "@/lib/contexts/admin-edit/types",
  "@/lib/contexts/admin-edit/content-store",
  "@/lib/contexts/admin-edit/useEditableSelection",
  "useEditableSelection",
  "mergeStagedChanges",
]) {
  assert(contextSource.includes(expected), `AdminEditContext must include ${expected}.`);
}

for (const removedResponsibility of [
  "interface StagedChange",
  "interface AdminEditContextType",
  "interface AdminEditProviderProps",
  "document.addEventListener",
  "closest<HTMLElement>",
  "new Date().toISOString",
]) {
  assert(!contextSource.includes(removedResponsibility), `AdminEditContext should not own ${removedResponsibility}.`);
}

const contextLines = contextSource.trimEnd().split("\n").length;
assert(contextLines <= 240, `AdminEditContext should be smaller after extraction, got ${contextLines} lines.`);

const storeSource = read("src/lib/contexts/admin-edit/content-store.ts");
for (const expected of [
  "getStoredContent",
  "getStoredMetadata",
  "stageContentChange",
  "removeStagedChange",
  "removeContentOverride",
  "mergeStagedChanges",
  "new Date().toISOString",
]) {
  assert(storeSource.includes(expected), `content-store module must include ${expected}.`);
}

const selectionSource = read("src/lib/contexts/admin-edit/useEditableSelection.ts");
for (const expected of ["document.addEventListener", "closest<HTMLElement>", "data-editable-key", "focusin"]) {
  assert(selectionSource.includes(expected), `useEditableSelection must include ${expected}.`);
}

const typesSource = read("src/lib/contexts/admin-edit/types.ts");
for (const expected of ["StagedChange", "AdminEditContextType", "AdminEditProviderProps", "PageContent"]) {
  assert(typesSource.includes(expected), `admin edit types must include ${expected}.`);
}

console.log("Admin edit context refactor checks passed.");
