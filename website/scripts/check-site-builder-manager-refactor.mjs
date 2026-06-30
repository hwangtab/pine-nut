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
  "src/components/admin/site-builder/useSiteBuilderState.ts",
  "src/components/admin/site-builder/SiteBuilderStatusMessage.tsx",
  "src/components/admin/site-builder/SiteBuilderSpecialPagesNotice.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const managerSource = read("src/components/admin/SiteBuilderManager.tsx");
for (const expected of [
  "useSiteBuilderState",
  "SiteBuilderStatusMessage",
  "SiteBuilderSpecialPagesNotice",
]) {
  assert(managerSource.includes(expected), `SiteBuilderManager must compose ${expected}.`);
}

for (const removedResponsibility of [
  "useState",
  "useMemo",
  "useTransition",
  "savePageContentAction",
  "validateBuilderLinks",
  "validateCustomSections",
  "parseBuilderLinks",
  "parseCustomSections",
  "serializeExistingSectionStyles",
  "Object.fromEntries",
]) {
  assert(!managerSource.includes(removedResponsibility), `SiteBuilderManager should not own ${removedResponsibility}.`);
}

const managerLines = managerSource.trimEnd().split("\n").length;
assert(managerLines <= 140, `SiteBuilderManager should stay orchestration-focused, got ${managerLines} lines.`);

const hookSource = read("src/components/admin/site-builder/useSiteBuilderState.ts");
for (const expected of [
  "useSiteBuilderSelection",
  "useSiteBuilderPersistence",
  "createInitialSectionsByPage",
]) {
  assert(hookSource.includes(expected), `useSiteBuilderState must include ${expected}.`);
}

const persistenceSource = read(
  "src/components/admin/site-builder/state/useSiteBuilderPersistence.ts",
);
for (const expected of [
  "savePageContentAction",
  "validateBuilderLinks",
  "validateCustomSections",
  "serializeExistingSectionStyles",
]) {
  assert(persistenceSource.includes(expected), `site builder persistence must include ${expected}.`);
}

console.log("Site builder manager refactor checks passed.");
