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

const routePath = "src/app/api/signatures/route.ts";
const modulePaths = [
  "src/lib/signatures/api/config.ts",
  "src/lib/signatures/api/request.ts",
  "src/lib/signatures/api/validation.ts",
  "src/lib/signatures/api/demo.ts",
  "src/lib/signatures/api/store.ts",
  "src/lib/signatures/api/responses.ts",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const routeSource = read(routePath);
assert(
  routeSource.trim().split(/\r?\n/).length <= 95,
  "signature route must stay a thin request/response orchestrator.",
);

for (const required of [
  "createSupabaseServiceClient",
  "readSignatureRequestBody",
  "validateSignatureSubmission",
  "getDemoSignatureSummary",
  "submitDemoSignature",
  "fetchSignatureSummary",
  "submitSignatureToStore",
  "hashIp",
]) {
  assert(routeSource.includes(required), `signature route must use ${required}.`);
}

for (const banned of [
  "createHash",
  "DEMO_SIGNATURES",
  "MESSAGE_MAX_LENGTH",
  "devRateLimitMap",
  "maskName",
  ".insert({",
  'select("name, message, created_at")',
  "/^[^\\s@]+@",
]) {
  assert(!routeSource.includes(banned), `signature route must not own ${banned}.`);
}

const configSource = read("src/lib/signatures/api/config.ts");
for (const required of [
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_MAX",
  "MESSAGE_MAX_LENGTH",
  "IS_PRODUCTION",
  "SERVICE_UNAVAILABLE_MESSAGE",
  "DUPLICATE_SIGNATURE_MESSAGE",
  "NAME_MAX_LENGTH",
  "AFFILIATION_MAX_LENGTH",
  "REGION_SUB_MAX_LENGTH",
  "SIGNATURE_GOAL",
  "WALL_PAGE_SIZE",
  "INVALID_REGION_MESSAGE",
  "INVALID_NAME_PUBLIC_MESSAGE",
]) {
  assert(configSource.includes(required), `signatures api config must contain ${required}.`);
}
assert(
  configSource.includes("MESSAGE_MAX_LENGTH = 500"),
  "signatures api config must raise MESSAGE_MAX_LENGTH to 500.",
);

const validationSource = read("src/lib/signatures/api/validation.ts");
for (const required of [
  "validateSignatureSubmission",
  "normalizedEmail",
  "messageText",
  "MESSAGE_MAX_LENGTH",
  "agreePrivacy",
  "agreeAge",
  "regionTop",
  "regionSub",
  "namePublic",
  "affiliation",
  "isValidRegionPair",
]) {
  assert(validationSource.includes(required), `signatures api validation must contain ${required}.`);
}

const demoSource = read("src/lib/signatures/api/demo.ts");
for (const required of [
  "devRateLimitMap",
  "getDemoSignatureSummary",
  "submitDemoSignature",
  "RATE_LIMIT_MAX",
]) {
  assert(demoSource.includes(required), `signatures api demo module must contain ${required}.`);
}

const storeSource = read("src/lib/signatures/api/store.ts");
for (const required of [
  "fetchSignatureSummary",
  "submitSignatureToStore",
  "ip_hash",
  "DUPLICATE_SIGNATURE_MESSAGE",
  "regionCount",
  "recent24h",
]) {
  assert(storeSource.includes(required), `signatures api store module must contain ${required}.`);
}
assert(
  !storeSource.includes("maskName"),
  "signatures api store module must not mask names — the wall only shows opt-in real names.",
);

const responseSource = read("src/lib/signatures/api/responses.ts");
for (const required of [
  "missingSignatureServiceResponse",
  "signatureApiErrorResponse",
  "SERVICE_UNAVAILABLE_MESSAGE",
  "isMissingSupabaseRelationError",
]) {
  assert(responseSource.includes(required), `signatures api responses module must contain ${required}.`);
}

console.log("Signatures API refactor checks passed.");
