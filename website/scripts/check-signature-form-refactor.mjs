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

// (4) client.ts's readApiErrorMessage() trusts the server's `error` body
// field unconditionally (see client.ts for why: filtering by status code
// briefly replaced this and silently swallowed real Korean validation
// messages like "이름을 입력해주세요."). That only stays safe as long as
// every *_MESSAGE constant api/config.ts hands to a response body is
// actually Korean — an English fallback (as INVALID_JSON_MESSAGE/
// FETCH_SIGNATURES_ERROR_MESSAGE/SUBMIT_SIGNATURE_ERROR_MESSAGE briefly
// were) would flow straight through to the signature form's error banner.
// Assert every `*_MESSAGE` constant's literal value contains Hangul, so a
// future addition that regresses to English fails loudly here instead of
// silently in production.
const configPath = "src/lib/signatures/api/config.ts";
const configSource = read(configPath);
const messageConstantPattern = /export const (\w*_MESSAGE)\s*=\s*"([^"]*)"/g;
const messageConstants = [...configSource.matchAll(messageConstantPattern)];
assert(
  messageConstants.length > 0,
  "api/config.ts must define at least one *_MESSAGE constant for this check to be meaningful.",
);
for (const [, name, value] of messageConstants) {
  assert(
    /[가-힣]/.test(value),
    `${name} in api/config.ts must be a Korean user-facing message (found: "${value}") — client.ts trusts these values verbatim in the signature form's error banner.`,
  );
}

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
