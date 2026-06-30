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
  "src/components/press/PressDocumentShell.tsx",
  "src/components/press/PressSectionHeading.tsx",
  "src/components/press/PressRichCallout.tsx",
  "src/components/press/PressContactSection.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const shellSource = read("src/components/press/PressDocumentShell.tsx");
for (const expected of [
  "UtilityHeader",
  "events.pressKitDownload",
  "window.print",
  "print-page",
  "no-print",
  "EditableLink",
]) {
  assert(shellSource.includes(expected), `PressDocumentShell must include ${expected}.`);
}

const contactSource = read("src/components/press/PressContactSection.tsx");
for (const expected of ["EditableSection", "EditableRichText", "value.split(\"\\n\")"]) {
  assert(contactSource.includes(expected), `PressContactSection must include ${expected}.`);
}

for (const [path, componentName, maxLines] of [
  ["src/app/press/release/page.tsx", "PressReleasePage", 300],
  ["src/app/press/factsheet/page.tsx", "FactsheetPage", 240],
]) {
  const source = read(path);
  for (const expected of [
    "PressDocumentShell",
    "PressSectionHeading",
    "PressRichCallout",
    "PressContactSection",
  ]) {
    assert(source.includes(expected), `${componentName} must compose ${expected}.`);
  }

  for (const removedResponsibility of [
    "UtilityHeader",
    "events.pressKitDownload",
    "window.print",
    "print-page",
    "no-print",
    "<style jsx global>",
    "EditableSection contentKey",
  ]) {
    assert(
      !source.includes(removedResponsibility),
      `${componentName} should not own ${removedResponsibility}.`,
    );
  }

  const lineCount = source.trimEnd().split("\n").length;
  assert(lineCount <= maxLines, `${componentName} should stay document-focused, got ${lineCount} lines.`);
}

console.log("Press document refactor checks passed.");
