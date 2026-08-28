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

// Value/call-shape assertions, not just substring presence — a comment or an
// unused field would satisfy the two checks above without the contract
// actually holding. This is the fifth time in this workstream a guard was
// caught only checking for a string's existence (Task 2a/3/4/14 before this),
// so each of the three checks below targets the exact expression, not a word.

// (1) Region validation must be delegated to isValidRegionPair(@/lib/regions),
// not reimplemented locally — that's the only place that knows about
// 세종(no sub-region) and 해외(free text 1~40 chars).
assert(
  /import\s*\{[^}]*\bisValidRegionPair\b[^}]*\}\s*from\s*["']@\/lib\/regions["']/.test(
    sharedSource,
  ),
  "signature form helpers must import isValidRegionPair from @/lib/regions instead of reimplementing region validation.",
);
assert(
  /isValidRegionPair\s*\(\s*values\.regionTop\s*,\s*values\.regionSub\s*\)/.test(sharedSource),
  "signature form helpers must call isValidRegionPair(values.regionTop, values.regionSub) to validate the region pair.",
);

// (2) namePublic must be serialized as a real JSON boolean. The server
// (api/validation.ts) 400s on `typeof body.namePublic !== "boolean"` — a
// stringified "true"/"false" would silently break every submission.
assert(
  /namePublic:\s*values\.namePublic\s*===\s*true/.test(sharedSource),
  "signature form helpers must serialize namePublic as a real boolean (namePublic: values.namePublic === true), not a string.",
);

// (3) Email is optional — an empty value must never become a required-field
// error. Only validate the pattern when a value is actually present.
assert(
  /if\s*\(\s*email\s*&&[^)]*EMAIL_PATTERN/.test(sharedSource),
  "signature form helpers must only validate email format when a value is present — email is optional and must not be required.",
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
