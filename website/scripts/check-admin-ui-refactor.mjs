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

const requiredFiles = [
  "src/components/admin/AdminToolbarDialogs.tsx",
  "src/components/admin/site-builder/CustomSectionButtonEditor.tsx",
  "src/components/admin/site-builder/CustomSectionCard.tsx",
  "src/components/admin/site-builder/custom-section-card/useCustomSectionCardActions.ts",
  "src/components/admin/site-builder/move-item.ts",
];

for (const file of requiredFiles) {
  assert(existsSync(join(root, file)), `${file} must exist after admin UI split.`);
}

const toolbarSource = read("src/components/admin/AdminToolbar.tsx");
assert(
  toolbarSource.includes("AdminToolbarDialogs"),
  "AdminToolbar must delegate confirmation dialogs to AdminToolbarDialogs.",
);
assert(
  !toolbarSource.includes('role="alertdialog"'),
  "AdminToolbar must not render alertdialog markup directly.",
);
assert(
  !toolbarSource.includes("useRef") && !toolbarSource.includes("useEffect"),
  "AdminToolbar must not own dialog focus/escape wiring directly.",
);

const dialogsSource = [
  read("src/components/admin/AdminToolbarDialogs.tsx"),
  read("src/components/admin/dialogs/AdminDialogFrame.tsx"),
].join("\n");
for (const expected of [
  "DiscardChangesDialog",
  "RevertKeyDialog",
  'role="alertdialog"',
]) {
  assert(dialogsSource.includes(expected), `AdminToolbarDialogs must include ${expected}.`);
}

const customSectionsSource = read("src/components/admin/site-builder/CustomSectionsEditor.tsx");
assert(
  customSectionsSource.includes("CustomSectionCard"),
  "CustomSectionsEditor must use the extracted CustomSectionCard component.",
);
assert(
  !customSectionsSource.includes("function CustomSectionCard"),
  "CustomSectionsEditor must not define CustomSectionCard inline.",
);
assert(
  !customSectionsSource.includes("function SectionButtonEditor"),
  "CustomSectionsEditor must not define button editors inline.",
);

const cardSource = read("src/components/admin/site-builder/CustomSectionCard.tsx");
assert(
  cardSource.includes("CustomSectionButtonEditor"),
  "CustomSectionCard must use the extracted button editor.",
);

const cardActionsSource = read(
  "src/components/admin/site-builder/custom-section-card/useCustomSectionCardActions.ts",
);
assert(
  cardActionsSource.includes("moveItem"),
  "CustomSectionCard actions must use the shared moveItem helper.",
);

const existingSource = read("src/components/admin/site-builder/ExistingSectionsEditor.tsx");
assert(
  existingSource.includes("./move-item"),
  "ExistingSectionsEditor must use the shared moveItem helper.",
);
assert(
  !existingSource.includes("function moveItem"),
  "ExistingSectionsEditor must not keep a local moveItem helper.",
);

console.log("Admin UI refactor checks passed.");
