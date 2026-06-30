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

const mainPath = "src/components/editable/EditableList.tsx";
const modulePaths = [
  "src/components/editable/editable-list/types.ts",
  "src/components/editable/editable-list/items.ts",
  "src/components/editable/editable-list/useEditableListEditor.ts",
  "src/components/editable/editable-list/EditableListModal.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 90,
  "EditableList.tsx must stay a small orchestration component.",
);

for (const required of [
  "useEditableListEditor",
  "EditableListModal",
  "children(items, false)",
  "children(items, true)",
]) {
  assert(mainSource.includes(required), `EditableList.tsx must include ${required}.`);
}

for (const banned of [
  "JSON.parse",
  "document.body.style.overflow",
  "localItems.map",
  "fields.map",
  "stageChange({",
]) {
  assert(!mainSource.includes(banned), `EditableList.tsx must not own ${banned}.`);
}

const itemsSource = read("src/components/editable/editable-list/items.ts");
for (const required of [
  "parseEditableListItems",
  "withEditableListIds",
  "stripEditableListIds",
  "createEmptyEditableListItem",
]) {
  assert(itemsSource.includes(required), `editable-list/items.ts must export ${required}.`);
}

const hookSource = read("src/components/editable/editable-list/useEditableListEditor.ts");
for (const required of [
  "useAdminEdit",
  "stageChange",
  "handleOpen",
  "handleSave",
  "updateItem",
  "moveItem",
]) {
  assert(hookSource.includes(required), `useEditableListEditor.ts must contain ${required}.`);
}

const modalSource = read("src/components/editable/editable-list/EditableListModal.tsx");
for (const required of [
  "localItems.map",
  "fields.map",
  'field.type === "textarea"',
  'field.type === "url"',
  "onCancel",
  "onSave",
]) {
  assert(modalSource.includes(required), `EditableListModal.tsx must contain ${required}.`);
}

console.log("EditableList refactor checks passed.");
