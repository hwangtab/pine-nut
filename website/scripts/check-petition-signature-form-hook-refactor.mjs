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
  "regionTop",
  "regionSub",
  "affiliation",
  "namePublic",
  "setAgreeConsent",
]) {
  assert(hookSource.includes(required), `usePetitionSignatureForm.ts must contain ${required}.`);
}

// ---------------------------------------------------------------------------
// 값·형태 단언
// ---------------------------------------------------------------------------

// (1) 제출 값은 진짜 폼 상태에서 와야 한다. Task 5가 컴파일 유지를 위해 넣었던
// `regionTop: ""` / `namePublic: null` 하드코딩이 남아 있으면 검증이 영원히
// 실패해 아무도 서명할 수 없다.
const valuesLiteral = hookSource.match(/SignatureFormValues\s*=>\s*\(\{([\s\S]*?)\n\s*\}\)/);
assert(
  valuesLiteral !== null,
  "usePetitionSignatureForm.ts must build a SignatureFormValues object literal in one place.",
);
for (const field of [
  "name",
  "email",
  "message",
  "regionTop",
  "regionSub",
  "affiliation",
  "namePublic",
  "agreePrivacy",
  "agreeAge",
]) {
  assert(
    new RegExp(`^\\s*${field},\\s*$`, "m").test(valuesLiteral[1]),
    `the submitted values must read ${field} straight from form state (shorthand \`${field},\`), never a hardcoded placeholder.`,
  );
}
assert(
  !/regionTop:\s*""/.test(hookSource) && !/regionSub:\s*""/.test(hookSource),
  "the region fields must no longer be pinned to an empty string — that made every submit fail validation.",
);
assert(
  !/namePublic:\s*null/.test(hookSource),
  "namePublic must no longer be pinned to null — that made every submit fail validation.",
);

// (2) 새 필드는 실제 useState로 관리돼야 한다.
for (const [field, initial] of [
  ["regionTop", '""'],
  ["regionSub", '""'],
  ["affiliation", '""'],
]) {
  assert(
    new RegExp(`const \\[${field}, set${field[0].toUpperCase()}${field.slice(1)}\\] = useState\\(${initial}\\)`).test(
      hookSource,
    ),
    `usePetitionSignatureForm.ts must own ${field} as React state.`,
  );
}
assert(
  /const \[namePublic, setNamePublic\] = useState<boolean \| null>\(null\)/.test(hookSource),
  "namePublic must start as null (not answered) so validation can require an explicit choice.",
);

// (3) 동의 체크박스는 화면에 1개지만 DB 컬럼은 둘(consent_privacy·consent_age)이다.
// setAgreeConsent 하나가 두 state를 함께 세팅해야 한다.
const consentSetter = hookSource.match(
  /const setAgreeConsent = useCallback\(\s*\(checked: boolean\) => \{([\s\S]*?)\}/,
);
assert(
  consentSetter !== null,
  "usePetitionSignatureForm.ts must expose setAgreeConsent(checked: boolean).",
);
assert(
  /setAgreePrivacy\(checked\)/.test(consentSetter[1]) && /setAgreeAge\(checked\)/.test(consentSetter[1]),
  "setAgreeConsent must set BOTH agreePrivacy and agreeAge — the DB requires consent_privacy and consent_age to be true.",
);

// (4) 무증상 검증 실패 방지 장치. UI가 렌더하는 오류 키 집합이 실제 오류 키
// 전체와 일치해야 한다 — 어긋나면 그 키의 거부가 화면에 안 뜨거나(무증상),
// 이미 필드 옆에 뜬 메시지가 배너에 중복된다.
const signatureFormLib = read("src/lib/signatures/form.ts");
const errorsInterface = signatureFormLib.match(
  /export interface SignatureFormErrors\s*\{([\s\S]*?)\n\}/,
);
assert(errorsInterface !== null, "could not read SignatureFormErrors from src/lib/signatures/form.ts.");
const errorKeys = [...errorsInterface[1].matchAll(/^\s*(\w+)\?:/gm)].map((match) => match[1]).sort();

const renderedSet = hookSource.match(/RENDERED_ERROR_KEYS[\s\S]*?\[([\s\S]*?)\]\)/);
assert(
  renderedSet !== null,
  "usePetitionSignatureForm.ts must keep the RENDERED_ERROR_KEYS safety net that surfaces unrendered validation errors.",
);
const declaredKeys = [...renderedSet[1].matchAll(/"(\w+)"/g)].map((match) => match[1]).sort();
assert(
  declaredKeys.join(",") === errorKeys.join(","),
  `RENDERED_ERROR_KEYS must list exactly the SignatureFormErrors keys the UI renders.\n  declared: ${declaredKeys.join(", ")}\n  actual:   ${errorKeys.join(", ")}`,
);
assert(
  /unrenderedKeys/.test(hookSource) && /setSubmitError\(/.test(hookSource),
  "the fallback banner for unrendered error keys must stay — it is what keeps a validation failure from being silent.",
);

const typesSource = read("src/components/petition/signature-form/types.ts");
for (const required of [
  "PetitionSignatureFormProps",
  "copy?: PetitionSignatureFormCopy",
  "PetitionSignatureFormState",
  "PetitionSignatureFieldIds",
  "PetitionSignaturePlaceholders",
  "regionTop: string",
  "regionSub: string",
  "affiliation: string",
  "namePublic: boolean | null",
  "setAgreeConsent",
  "affiliationId: string",
  "namePublicYesId: string",
  "namePublicNoId: string",
  "consentErrorId: string",
]) {
  assert(typesSource.includes(required), `signature-form/types.ts must contain ${required}.`);
}

// ── 성공 화면·명단 벽에 뜨는 이름과 DB에 저장되는 이름은 같아야 한다.
// 서버(api/validation.ts)는 name.trim()을 저장하는데, onSubmitted가 trim 전
// 값을 넘기면 앞뒤 공백을 넣은 사람이 성공 화면에서 다른 이름을 본다.
assert(
  /onSubmitted\(\{ name: name\.trim\(\) \}\)/.test(hookSource),
  "usePetitionSignatureForm must pass the trimmed name to onSubmitted — the server stores name.trim() (src/lib/signatures/api/validation.ts), so an untrimmed name shows the signer a different name on the success screen than the one that lands in the DB and on the wall.",
);
assert(
  /name:\s*name\.trim\(\)/.test(read("src/lib/signatures/api/validation.ts")),
  "src/lib/signatures/api/validation.ts must still store name.trim() — the assertion above depends on it.",
);

console.log("Petition signature form hook refactor checks passed.");
