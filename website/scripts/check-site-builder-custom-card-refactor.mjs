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
  "src/components/admin/site-builder/custom-section-card/types.ts",
  "src/components/admin/site-builder/custom-section-card/useCustomSectionCardActions.ts",
  "src/components/admin/site-builder/custom-section-card/CustomSectionCardActions.tsx",
  "src/components/admin/site-builder/custom-section-card/CustomSectionTextFields.tsx",
  "src/components/admin/site-builder/custom-section-card/CustomSectionMediaFields.tsx",
  "src/components/admin/site-builder/custom-section-card/CustomSectionDisplayOptions.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const cardSource = read("src/components/admin/site-builder/CustomSectionCard.tsx");
for (const expected of [
  "useCustomSectionCardActions",
  "CustomSectionCardActions",
  "CustomSectionTextFields",
  "CustomSectionMediaFields",
  "CustomSectionDisplayOptions",
  "CustomSectionButtonEditor",
]) {
  assert(cardSource.includes(expected), `CustomSectionCard must compose ${expected}.`);
}

for (const removedResponsibility of [
  "createEmptyCustomSection",
  "moveItem",
  "updateSection =",
  "<input",
  "<textarea",
  "<select",
]) {
  assert(!cardSource.includes(removedResponsibility), `CustomSectionCard should not own ${removedResponsibility}.`);
}

const cardLines = cardSource.trimEnd().split("\n").length;
assert(cardLines <= 90, `CustomSectionCard should stay layout-focused, got ${cardLines} lines.`);

const actionsSource = read(
  "src/components/admin/site-builder/custom-section-card/useCustomSectionCardActions.ts",
);
for (const expected of [
  "createEmptyCustomSection",
  "moveItem",
  "updateSection",
  "duplicateSection",
  "deleteSection",
]) {
  assert(actionsSource.includes(expected), `custom section card actions must own ${expected}.`);
}

const displaySource = read(
  "src/components/admin/site-builder/custom-section-card/CustomSectionDisplayOptions.tsx",
);
for (const expected of ["<select", "visible", "theme", "align"]) {
  assert(displaySource.includes(expected), `display options must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"site-builder-custom-card:refactor:check"'),
  "package.json must expose site-builder-custom-card:refactor:check.",
);

console.log("Site builder custom section card refactor checks passed.");
