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

const mainPath = "src/components/petition/PetitionSignatureForm.tsx";
const modulePaths = [
  "src/components/petition/signature-form/types.ts",
  "src/components/petition/signature-form/usePetitionSignatureForm.ts",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 120,
  "PetitionSignatureForm.tsx must stay a small orchestration component.",
);

for (const required of [
  "usePetitionSignatureForm",
  "PetitionFormFields",
  "PetitionConsentFields",
  "PetitionFormEditControls",
  "PetitionFormText",
]) {
  assert(mainSource.includes(required), `PetitionSignatureForm.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "useCallback",
  "type FormEvent",
  "validateSignatureForm",
  "submitSignatureForm",
  "events.signatureStart",
  "events.signatureComplete",
  "getContent(",
  "setSignatureStartedTracked",
]) {
  assert(!mainSource.includes(banned), `PetitionSignatureForm.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/petition/signature-form/usePetitionSignatureForm.ts");
for (const required of [
  "useAdminEdit",
  "validateSignatureForm",
  "submitSignatureForm",
  "events.signatureStart",
  "events.signatureComplete",
  "handleSubmit",
  "handleFocusCapture",
  "clearError",
  "editFields",
]) {
  assert(hookSource.includes(required), `usePetitionSignatureForm.ts must contain ${required}.`);
}

const typesSource = read("src/components/petition/signature-form/types.ts");
for (const required of [
  "PetitionSignatureFormProps",
  "copy?: PetitionSignatureFormCopy",
  "PetitionSignatureFormState",
  "PetitionSignatureFieldIds",
  "PetitionSignaturePlaceholders",
]) {
  assert(typesSource.includes(required), `signature-form/types.ts must contain ${required}.`);
}

console.log("Petition signature form hook refactor checks passed.");
