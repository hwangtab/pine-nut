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

const sharedPath = "src/lib/signatures/form.ts";
assert(existsSync(join(root, sharedPath)), "shared signature form helpers must exist.");

const sharedSource = read(sharedPath);
for (const exportName of [
  "validateSignatureForm",
  "submitSignatureForm",
  "SignatureFormErrors",
]) {
  assert(sharedSource.includes(exportName), `signature form helpers must export ${exportName}.`);
}

const componentBundles = [
  {
    label: "src/components/petition/PetitionSignatureForm.tsx",
    source: [
      read("src/components/petition/PetitionSignatureForm.tsx"),
      read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
    ].join("\n"),
  },
  {
    label: "src/components/home/HomeInlineSignatureForm.tsx",
    source: [
      read("src/components/home/HomeInlineSignatureForm.tsx"),
      read("src/components/home/inline-signature/useHomeInlineSignatureForm.ts"),
    ].join("\n"),
  },
];

for (const { label, source } of componentBundles) {
  assert(
    source.includes("@/lib/signatures/form"),
    `${label} must use shared signature form helpers.`,
  );
  assert(
    source.includes("validateSignatureForm"),
    `${label} must validate through shared signature form helpers.`,
  );
  assert(
    source.includes("submitSignatureForm"),
    `${label} must submit through shared signature form helpers.`,
  );
  assert(
    !source.includes("@/lib/signatures/client"),
    `${label} must not import signature client primitives directly.`,
  );
  assert(!source.includes("isValidEmail"), `${label} must not duplicate email validation.`);
  assert(!source.includes("submitSignature("), `${label} must not call submitSignature directly.`);
}

console.log("Signature form refactor checks passed.");
