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

const copyPath = "src/components/petition/petition-copy.ts";

assert(
  existsSync(join(root, copyPath)),
  "petition locale copy must live in a shared petition-copy.ts module.",
);

const copySource = [
  read(copyPath),
  read("src/components/petition/copy/form.ts"),
  read("src/components/petition/copy/success.ts"),
  read("src/components/petition/copy/share.ts"),
].join("\n");
for (const exportName of [
  "koreanPetitionFormCopy",
  "englishPetitionFormCopy",
  "koreanPetitionSuccessCopy",
  "englishPetitionSuccessCopy",
  "koreanPetitionShareEditFields",
  "englishPetitionShareEditFields",
]) {
  assert(
    copySource.includes(exportName),
    `petition-copy.ts must export ${exportName}.`,
  );
}

const formSource = [
  read("src/components/petition/PetitionSignatureForm.tsx"),
  read("src/components/petition/signature-form/types.ts"),
  read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
].join("\n");
assert(
  formSource.includes("copy?: PetitionSignatureFormCopy"),
  "PetitionSignatureForm must accept a locale copy config.",
);
assert(
  formSource.includes("koreanPetitionFormCopy"),
  "PetitionSignatureForm must keep Korean defaults through the shared copy config.",
);

const successSource = read("src/components/petition/PetitionSuccess.tsx");
assert(
  successSource.includes("copy?: PetitionSuccessCopy"),
  "PetitionSuccess must accept a locale copy config.",
);

const shareControlsSource = read("src/components/petition/PetitionShareEditControls.tsx");
assert(
  shareControlsSource.includes("fields?: PetitionShareEditField[]"),
  "PetitionShareEditControls must render locale-specific editable share fields.",
);

const englishPage = read("src/app/en/petition/page.tsx");
for (const required of [
  "PetitionSignatureForm",
  "PetitionSuccess",
  "PetitionShareEditControls",
  "englishPetitionFormCopy",
  "englishPetitionSuccessCopy",
  "englishPetitionShareEditFields",
]) {
  assert(
    englishPage.includes(required),
    `/en/petition must use shared petition component ${required}.`,
  );
}

for (const banned of [
  "submitSignature",
  "isValidEmail",
  "type FormEvent",
  "handleSubmit",
  "const [submitting",
  "const [submitError",
  "const [showPrivacy",
  "const [signatureStartedTracked",
  "const [name",
  "const [email",
  "const [message",
  "const [agreePrivacy",
  "const [agreeAge",
  "const [errors",
]) {
  assert(
    !englishPage.includes(banned),
    `/en/petition must not duplicate signature form logic: found ${banned}.`,
  );
}

console.log("Petition refactor checks passed.");
