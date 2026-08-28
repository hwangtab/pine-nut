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

const copyBarrelPath = "src/components/petition/petition-copy.ts";
const copyModulePaths = [
  "src/components/petition/copy/types.ts",
  "src/components/petition/copy/form.ts",
  "src/components/petition/copy/success.ts",
  "src/components/petition/copy/share.ts",
];

for (const modulePath of copyModulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const copyBarrelSource = read(copyBarrelPath);
assert(
  copyBarrelSource.trim().split(/\r?\n/).length <= 8,
  "petition-copy.ts must stay a small compatibility barrel.",
);

for (const exportedModule of ["./copy/types", "./copy/form", "./copy/success", "./copy/share"]) {
  assert(
    copyBarrelSource.includes(`export * from "${exportedModule}";`),
    `petition-copy.ts must re-export ${exportedModule}.`,
  );
}

for (const banned of [
  "contentKey:",
  "defaultValue:",
  "privacyLines:",
  "primaryShareClassName:",
  "koreanPetitionFormCopy:",
  "englishPetitionFormCopy:",
]) {
  assert(
    !copyBarrelSource.includes(banned),
    `petition-copy.ts must not own petition copy data: found ${banned}.`,
  );
}

const typeSource = read("src/components/petition/copy/types.ts");
for (const exportName of [
  "PetitionEditableTextCopy",
  "PetitionEditableValueCopy",
  "PetitionSignatureFormCopy",
  "PetitionSuccessCopy",
  "PetitionShareEditField",
]) {
  assert(typeSource.includes(`export interface ${exportName}`), `copy/types.ts must export ${exportName}.`);
}
for (const newField of [
  "regionLabel",
  "regionTopPlaceholder",
  "regionSubPlaceholder",
  "overseasSubPlaceholder",
  "affiliationLabel",
  "affiliationPlaceholder",
  "namePublicLabel",
  "namePublicYes",
  "namePublicNo",
  "namePublicNote",
]) {
  assert(
    typeSource.includes(newField),
    `copy/types.ts must declare ${newField} on PetitionSignatureFormCopy.`,
  );
}

const formSource = read("src/components/petition/copy/form.ts");
for (const required of [
  "koreanPetitionFormCopy",
  'fieldIdPrefix: "sig"',
  "privacyLines",
  "regionLabel",
  "regionTopPlaceholder",
  "regionSubPlaceholder",
  "overseasSubPlaceholder",
  "affiliationLabel",
  "affiliationPlaceholder",
  "namePublicLabel",
  "namePublicYes",
  "namePublicNo",
  "namePublicNote",
]) {
  assert(formSource.includes(required), `copy/form.ts must contain ${required}.`);
}
for (const removed of ["englishPetitionFormCopy", 'fieldIdPrefix: "en-sig"']) {
  assert(
    !formSource.includes(removed),
    `copy/form.ts must not contain ${removed} (English form copy removed).`,
  );
}

const successSource = read("src/components/petition/copy/success.ts");
for (const required of ["koreanPetitionSuccessCopy", "countLocale", "primaryShareClassName"]) {
  assert(successSource.includes(required), `copy/success.ts must contain ${required}.`);
}
assert(
  !successSource.includes("englishPetitionSuccessCopy"),
  "copy/success.ts must not contain englishPetitionSuccessCopy (English form removed).",
);

const shareSource = read("src/components/petition/copy/share.ts");
for (const required of ["koreanPetitionShareEditFields", 'section: "share"']) {
  assert(shareSource.includes(required), `copy/share.ts must contain ${required}.`);
}
assert(
  !shareSource.includes("englishPetitionShareEditFields"),
  "copy/share.ts must not contain englishPetitionShareEditFields (English form removed).",
);

console.log("Petition copy refactor checks passed.");
