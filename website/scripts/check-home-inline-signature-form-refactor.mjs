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

const mainPath = "src/components/home/HomeInlineSignatureForm.tsx";
const modulePaths = [
  "src/components/home/inline-signature/types.ts",
  "src/components/home/inline-signature/useHomeInlineSignatureForm.ts",
  "src/components/home/inline-signature/HomeInlineSignatureFields.tsx",
  "src/components/home/inline-signature/HomeInlineSignatureSuccess.tsx",
  "src/components/home/inline-signature/HomeInlineSignaturePrivacyNotice.tsx",
  "src/components/home/inline-signature/HomeInlineSignatureEditControls.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 85,
  "HomeInlineSignatureForm.tsx must stay a small orchestration component.",
);

for (const required of [
  "useHomeInlineSignatureForm",
  "HomeInlineSignatureFields",
  "HomeInlineSignatureSuccess",
  "HomeInlineSignaturePrivacyNotice",
  "HomeInlineSignatureEditControls",
]) {
  assert(mainSource.includes(required), `HomeInlineSignatureForm.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "useCallback",
  "type FormEvent",
  "validateSignatureForm",
  "submitSignatureForm",
  "EditableValue",
  "setInline",
]) {
  assert(!mainSource.includes(banned), `HomeInlineSignatureForm.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/home/inline-signature/useHomeInlineSignatureForm.ts");
for (const required of [
  "useState",
  "validateSignatureForm",
  "submitSignatureForm",
  "onSignatureCountChange",
  "handleSubmit",
  "namePlaceholder",
  "emailPlaceholder",
]) {
  assert(hookSource.includes(required), `useHomeInlineSignatureForm.ts must contain ${required}.`);
}

const fieldsSource = read("src/components/home/inline-signature/HomeInlineSignatureFields.tsx");
for (const required of [
  'id="inline-name"',
  'id="inline-email"',
  "submitting",
  "onNameChange",
  "onEmailChange",
]) {
  assert(fieldsSource.includes(required), `HomeInlineSignatureFields.tsx must contain ${required}.`);
}

const editControlsSource = read("src/components/home/inline-signature/HomeInlineSignatureEditControls.tsx");
for (const required of [
  "EditableValue",
  "home.cta.inlineNamePlaceholder",
  "home.cta.inlineEmailPlaceholder",
  "home.cta.inlineErrorName",
  "home.cta.inlineErrorEmail",
  "home.cta.inlineErrorSubmit",
]) {
  assert(editControlsSource.includes(required), `HomeInlineSignatureEditControls.tsx must contain ${required}.`);
}

console.log("Home inline signature form refactor checks passed.");
