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
  "src/lib/custom-sections/id.ts",
  "src/lib/custom-sections/pages.ts",
  "src/lib/custom-sections/links.ts",
  "src/lib/custom-sections/custom-section-data.ts",
  "src/lib/custom-sections/existing-section-data.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const barrelSource = read("src/lib/custom-sections.ts");
for (const expected of [
  "export * from \"./custom-sections/pages\"",
  "export * from \"./custom-sections/links\"",
  "export * from \"./custom-sections/custom-section-data\"",
  "export * from \"./custom-sections/existing-section-data\"",
]) {
  assert(barrelSource.includes(expected), `custom-sections barrel must include ${expected}.`);
}

for (const removedResponsibility of [
  "validateOptionalImageUrl",
  "validateEditableHref",
  "function randomId",
  "parseBuilderLinks",
  "parseCustomSections",
  "parseExistingSectionOrder",
]) {
  assert(!barrelSource.includes(removedResponsibility), `custom-sections barrel should not own ${removedResponsibility}.`);
}

const barrelLines = barrelSource.trimEnd().split("\n").length;
assert(barrelLines <= 20, `custom-sections barrel should stay tiny, got ${barrelLines} lines.`);

const linksSource = read("src/lib/custom-sections/links.ts");
for (const expected of ["validateEditableHref", "BuilderLinkItem", "parseBuilderLinks", "defaultNavLinks", "defaultFooterLinks"]) {
  assert(linksSource.includes(expected), `links module must include ${expected}.`);
}

const customSectionSource = read("src/lib/custom-sections/custom-section-data.ts");
for (const expected of ["validateOptionalImageUrl", "validateEditableHref", "CustomSection", "parseCustomSections", "validateCustomSections"]) {
  assert(customSectionSource.includes(expected), `custom section module must include ${expected}.`);
}

const existingSectionSource = read("src/lib/custom-sections/existing-section-data.ts");
for (const expected of ["SECTION_THEME_OPTIONS", "parseExistingSectionOrder", "parseExistingSectionStyles", "serializeExistingSectionStyles"]) {
  assert(existingSectionSource.includes(expected), `existing section module must include ${expected}.`);
}

const pagesSource = read("src/lib/custom-sections/pages.ts");
for (const expected of ["BUILDER_PAGES", "BuilderPageId", "EXISTING_PAGE_SECTIONS"]) {
  assert(pagesSource.includes(expected), `pages module must include ${expected}.`);
}

console.log("Custom sections refactor checks passed.");
