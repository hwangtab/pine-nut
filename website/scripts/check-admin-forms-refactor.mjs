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
  "src/components/admin/form/AdminFormError.tsx",
  "src/components/admin/form/AdminImageFileField.tsx",
  "src/components/admin/form/AdminSelectField.tsx",
  "src/components/admin/form/AdminSubmitButton.tsx",
  "src/components/admin/form/AdminTextField.tsx",
  "src/components/admin/form/AdminTextareaField.tsx",
  "src/components/admin/form/styles.ts",
  "src/components/admin/form/index.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

for (const formPath of [
  "src/components/admin/NewsForm.tsx",
  "src/components/admin/TimelineForm.tsx",
]) {
  const source = read(formPath);
  for (const expected of [
    "AdminFormError",
    "AdminImageFileField",
    "AdminSelectField",
    "AdminSubmitButton",
    "AdminTextField",
    "AdminTextareaField",
  ]) {
    assert(source.includes(expected), `${formPath} must compose ${expected}.`);
  }

  for (const removedResponsibility of [
    "useFormStatus",
    "function SubmitButton",
    "focus:ring-2",
    "file:mr-3",
  ]) {
    assert(!source.includes(removedResponsibility), `${formPath} should not own ${removedResponsibility}.`);
  }

  const lineCount = source.trimEnd().split("\n").length;
  assert(lineCount <= 115, `${formPath} should stay field-composition-focused, got ${lineCount} lines.`);
}

const submitSource = read("src/components/admin/form/AdminSubmitButton.tsx");
for (const expected of ["useFormStatus", "variant", "저장 중..."]) {
  assert(submitSource.includes(expected), `AdminSubmitButton must own ${expected}.`);
}

const stylesSource = read("src/components/admin/form/styles.ts");
for (const expected of ["AdminFormVariant", "forest", "sky", "file:mr-3"]) {
  assert(stylesSource.includes(expected), `admin form styles must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"admin-forms:refactor:check"'),
  "package.json must expose admin-forms:refactor:check.",
);

console.log("Admin forms refactor checks passed.");
