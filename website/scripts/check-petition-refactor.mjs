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
  "koreanPetitionSuccessCopy",
  "koreanPetitionShareEditFields",
]) {
  assert(
    copySource.includes(exportName),
    `petition-copy.ts must export ${exportName}.`,
  );
}

// /en/petition no longer renders a signature form (it's a static English
// summary page — see the banned-reference check below), so the English form
// copy is dead. Task 6 removed it; this guard now asserts it stays removed
// rather than requiring it to exist.
for (const removedExportName of [
  "englishPetitionFormCopy",
  "englishPetitionSuccessCopy",
  "englishPetitionShareEditFields",
]) {
  assert(
    !copySource.includes(removedExportName),
    `petition-copy.ts must not export ${removedExportName} (English form copy was removed).`,
  );
}

const formSource = [
  read("src/components/petition/PetitionSignatureForm.tsx"),
  read("src/components/petition/signature-form/types.ts"),
  read("src/components/petition/signature-form/usePetitionSignatureForm.ts"),
].join("\n");
assert(
  formSource.includes("copy?: PetitionSignatureFormCopy"),
  "PetitionSignatureForm must keep accepting a locale copy config (used by /petition).",
);

const successSource = read("src/components/petition/PetitionSuccess.tsx");
assert(
  successSource.includes("copy?: PetitionSuccessCopy"),
  "PetitionSuccess must keep accepting a locale copy config (used by /petition).",
);

const englishPage = read("src/app/en/petition/page.tsx");

for (const banned of [
  "PetitionSignatureForm",
  "PetitionSuccess",
  "PetitionActionCards",
  "englishPetitionFormCopy",
  "englishPetitionSuccessCopy",
  "englishPetitionShareEditFields",
  "usePetitionSignatureSummary",
  "useState",
  '"use client"',
]) {
  assert(
    !englishPage.includes(banned),
    `/en/petition must stay a static English summary page: found ${banned}.`,
  );
}

// 부분문자열 검사만으로는 주석·죽은 변수에 "/petition" 텍스트만 남아도 통과한다.
// check-home-cta-refactor.mjs와 같은 방식으로, 주석을 제거하고 실제 <a>/<EditableLink>
// 태그의 href/defaultHref 속성 안에서만 찾는다.
const sourceWithoutComments = englishPage
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");
const linkTags = sourceWithoutComments.match(/<(?:a|EditableLink)\b[^>]*>/g) ?? [];
const hasWorkingPetitionLink = linkTags.some(
  (tag) =>
    /(?:^|\s)href=["']\/petition["']/.test(tag) ||
    /(?:^|\s)defaultHref=["']\/petition["']/.test(tag),
);
assert(
  hasWorkingPetitionLink,
  '/en/petition must render a working <a>/<EditableLink> tag whose href/defaultHref is literally "/petition" — a comment or dead reference does not count.',
);

for (const fact of ["1937", "2017", "111,999", "2,256", "600", "62", "51", "80"]) {
  assert(
    englishPage.includes(fact),
    `/en/petition summary must preserve the source fact: ${fact}.`,
  );
}

assert(
  !existsSync(join(root, "src/components/petition/PetitionActionCards.tsx")),
  "PetitionActionCards must be removed once no page renders it.",
);

console.log("Petition refactor checks passed.");
