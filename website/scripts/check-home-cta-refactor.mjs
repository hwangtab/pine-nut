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

const inlineFormPath = "src/components/home/HomeInlineSignatureForm.tsx";
assert(existsSync(join(root, inlineFormPath)), "Home inline signature form must be extracted.");

const sectionSource = read("src/components/home/HomeCtaSection.tsx");
assert(
  sectionSource.includes("HomeInlineSignatureForm"),
  "HomeCtaSection must render the extracted HomeInlineSignatureForm.",
);
for (const banned of [
  "inlineName",
  "inlineEmail",
  "inlineSubmitting",
  "inlineSuccess",
  "inlineError",
  "validateSignatureForm",
  "submitSignatureForm",
  "EditableValue",
  "type FormEvent",
]) {
  assert(
    !sectionSource.includes(banned),
    `HomeCtaSection must not keep inline signature form internals: found ${banned}.`,
  );
}

const formSource = [
  read(inlineFormPath),
  read("src/components/home/inline-signature/useHomeInlineSignatureForm.ts"),
  read("src/components/home/inline-signature/HomeInlineSignatureEditControls.tsx"),
].join("\n");
for (const expected of [
  "validateSignatureForm",
  "submitSignatureForm",
  "onSignatureCountChange",
  "EditableValue",
]) {
  assert(formSource.includes(expected), `HomeInlineSignatureForm must include ${expected}.`);
}

console.log("Home CTA refactor checks passed.");
