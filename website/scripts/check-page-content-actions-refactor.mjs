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
  "src/lib/actions/page-content/types.ts",
  "src/lib/actions/page-content/validation.ts",
  "src/lib/actions/page-content/revalidation.ts",
  "src/lib/actions/page-content/restore-payload.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const actionSource = read("src/lib/actions/page-content.ts");
for (const expected of [
  "@/lib/actions/page-content/types",
  "@/lib/actions/page-content/validation",
  "@/lib/actions/page-content/revalidation",
  "@/lib/actions/page-content/restore-payload",
  "normalizeContentChanges",
  "revalidatePageContentPages",
  "parsePageContentRestoreRows",
]) {
  assert(actionSource.includes(expected), `page-content action must include ${expected}.`);
}

for (const removedResponsibility of [
  "KEY_PATTERN",
  "CONTENT_TYPES",
  "PUBLIC_PAGE_PATHS",
  "PAGE_PATHS",
  "function normalizeChange",
  "function revalidatePageContentPages",
]) {
  assert(!actionSource.includes(removedResponsibility), `page-content action should not own ${removedResponsibility}.`);
}

const actionLines = actionSource.trimEnd().split("\n").length;
assert(actionLines <= 230, `page-content action should stay action-focused, got ${actionLines} lines.`);

const validationSource = read("src/lib/actions/page-content/validation.ts");
for (const expected of ["KEY_PATTERN", "CONTENT_TYPES", "validateContentKey", "normalizeChange", "normalizeContentChanges"]) {
  assert(validationSource.includes(expected), `validation module must include ${expected}.`);
}

const revalidationSource = read("src/lib/actions/page-content/revalidation.ts");
for (const expected of ["PUBLIC_PAGE_PATHS", "PAGE_PATHS", "revalidatePath", "revalidatePageContentPages"]) {
  assert(revalidationSource.includes(expected), `revalidation module must include ${expected}.`);
}

const restoreSource = read("src/lib/actions/page-content/restore-payload.ts");
for (const expected of ["parsePageContentRestoreRows", "ContentChange", "normalizedPayload"]) {
  assert(restoreSource.includes(expected), `restore payload module must include ${expected}.`);
}

console.log("Page content actions refactor checks passed.");
