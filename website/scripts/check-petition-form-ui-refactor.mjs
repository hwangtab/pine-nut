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

for (const path of [
  "src/components/petition/PetitionFormText.tsx",
  "src/components/petition/PetitionFormFields.tsx",
  "src/components/petition/PetitionConsentFields.tsx",
  "src/components/petition/PetitionFormEditControls.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const formSource = read("src/components/petition/PetitionSignatureForm.tsx");
for (const componentName of [
  "PetitionFormText",
  "PetitionFormFields",
  "PetitionConsentFields",
  "PetitionFormEditControls",
]) {
  assert(
    formSource.includes(componentName),
    `PetitionSignatureForm must compose ${componentName}.`,
  );
}

for (const removedResponsibility of [
  "function FormText",
  "function EditControl",
  "EditableText",
  "EditableValue",
  "htmlFor={nameId}",
  "htmlFor={emailId}",
  "htmlFor={messageId}",
]) {
  assert(
    !formSource.includes(removedResponsibility),
    `PetitionSignatureForm should not own ${removedResponsibility}.`,
  );
}

const fieldsSource = read("src/components/petition/PetitionFormFields.tsx");
for (const expected of [
  "PetitionFormText",
  "SignatureFormErrors",
  "textarea",
  "message.length",
  "clearError(\"name\")",
  "clearError(\"email\")",
]) {
  assert(fieldsSource.includes(expected), `PetitionFormFields must include ${expected}.`);
}

const consentSource = read("src/components/petition/PetitionConsentFields.tsx");
for (const expected of [
  "PetitionFormText",
  "SignatureFormErrors",
  "privacyLines.map",
  "clearError(\"agreePrivacy\")",
  "clearError(\"agreeAge\")",
]) {
  assert(consentSource.includes(expected), `PetitionConsentFields must include ${expected}.`);
}

const editControlsSource = read("src/components/petition/PetitionFormEditControls.tsx");
for (const expected of ["EditableValue", "PetitionEditableValueCopy", "fields.map"]) {
  assert(
    editControlsSource.includes(expected),
    `PetitionFormEditControls must include ${expected}.`,
  );
}

const textSource = read("src/components/petition/PetitionFormText.tsx");
for (const expected of ["EditableText", "PetitionEditableTextCopy", 'section="form"']) {
  assert(textSource.includes(expected), `PetitionFormText must include ${expected}.`);
}

console.log("Petition form UI refactor checks passed.");
