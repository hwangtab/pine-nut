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

// PageContent가 화면이 실제로 읽는 4개 필드(content_key·value·metadata·page)로
// 좁혀지면서 updated_at이 사라졌다. 예전 이 목록에 있던 "new Date().toISOString"은
// store가 그 값을 찍는다는 뜻이었는데, 이제 찍을 필드가 없다. 컨텍스트가 타임스탬프를
// 소유하지 않는다는 아래(제거 목록) 검사는 그대로 남아 의도를 지킨다.
const storeSource = read("src/lib/contexts/admin-edit/content-store.ts");
for (const expected of [
  "getStoredContent",
  "getStoredMetadata",
  "stageContentChange",
  "removeStagedChange",
  "removeContentOverride",
  "mergeStagedChanges",
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
