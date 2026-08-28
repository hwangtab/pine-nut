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
  "SignatureFormValues",
]) {
  assert(sharedSource.includes(exportName), `signature form helpers must export ${exportName}.`);
}
assert(
  sharedSource.includes("regionTop"),
  "signature form helpers must validate regionTop for the solidarity petition.",
);
assert(
  sharedSource.includes("namePublic"),
  "signature form helpers must validate namePublic for the solidarity petition.",
);

const petitionSource = [
  read("src/components/petition/PetitionSignatureForm.tsx"),
  read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
].join("\n");

assert(
  petitionSource.includes("@/lib/signatures/form"),
  "PetitionSignatureForm must use shared signature form helpers.",
);
assert(
  petitionSource.includes("validateSignatureForm"),
  "PetitionSignatureForm must validate through shared signature form helpers.",
);
assert(
  petitionSource.includes("submitSignatureForm"),
  "PetitionSignatureForm must submit through shared signature form helpers.",
);
assert(
  !petitionSource.includes("@/lib/signatures/client"),
  "PetitionSignatureForm must not import signature client primitives directly.",
);
assert(!petitionSource.includes("isValidEmail"), "PetitionSignatureForm must not duplicate email validation.");
assert(!petitionSource.includes("submitSignature("), "PetitionSignatureForm must not call submitSignature directly.");

console.log("Signature form refactor checks passed.");
