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

const paths = [
  "src/components/admin/site-builder/useSiteBuilderState.ts",
  "src/components/admin/site-builder/state/initial-site-builder-state.ts",
  "src/components/admin/site-builder/state/preview-paths.ts",
  "src/components/admin/site-builder/state/useSiteBuilderPersistence.ts",
  "src/components/admin/site-builder/state/useSiteBuilderSelection.ts",
];

for (const path of paths) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const hookSource = read("src/components/admin/site-builder/useSiteBuilderState.ts");
for (const expected of [
  "createInitialNavLinks",
  "createInitialFooterLinks",
  "createInitialSectionsByPage",
  "createInitialSectionOrdersByPage",
  "createInitialSectionStylesByPage",
  "useSiteBuilderPersistence",
  "useSiteBuilderSelection",
]) {
  assert(hookSource.includes(expected), `useSiteBuilderState must delegate ${expected}.`);
}

for (const removedResponsibility of [
  "savePageContentAction",
  "validateBuilderLinks",
  "validateCustomSections",
  "parseBuilderLinks",
  "parseCustomSections",
  "parseExistingSectionOrder",
  "parseExistingSectionStyles",
  "serializeExistingSectionStyles",
  "useMemo",
  "useTransition",
  "PAGE_PREVIEW_PATHS",
]) {
  assert(
    !hookSource.includes(removedResponsibility),
    `useSiteBuilderState should not own ${removedResponsibility}.`,
  );
}

const hookLines = hookSource.trimEnd().split("\n").length;
assert(hookLines <= 95, `useSiteBuilderState should stay orchestration-focused, got ${hookLines} lines.`);

const initialStateSource = read(
  "src/components/admin/site-builder/state/initial-site-builder-state.ts",
);
for (const expected of [
  "parseBuilderLinks",
  "parseCustomSections",
  "parseExistingSectionOrder",
  "parseExistingSectionStyles",
  "defaultNavLinks",
  "defaultFooterLinks",
]) {
  assert(initialStateSource.includes(expected), `initial state helper must own ${expected}.`);
}

const persistenceSource = read(
  "src/components/admin/site-builder/state/useSiteBuilderPersistence.ts",
);
for (const expected of [
  "savePageContentAction",
  "validateBuilderLinks",
  "validateCustomSections",
  "serializeExistingSectionStyles",
  "saveGlobalLinks",
  "saveSections",
  "saveExistingSections",
]) {
  assert(persistenceSource.includes(expected), `persistence helper must own ${expected}.`);
}

const selectionSource = read(
  "src/components/admin/site-builder/state/useSiteBuilderSelection.ts",
);
for (const expected of [
  "useMemo",
  "BUILDER_PAGES",
  "EXISTING_PAGE_SECTIONS",
  "PAGE_PREVIEW_PATHS",
]) {
  assert(selectionSource.includes(expected), `selection helper must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"site-builder-state:refactor:check"'),
  "package.json must expose site-builder-state:refactor:check.",
);

console.log("Site builder state refactor checks passed.");
