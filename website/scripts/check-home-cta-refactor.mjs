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

const inlineFormPath = "src/components/home/HomeInlineSignatureForm.tsx";
assert(
  !existsSync(join(root, inlineFormPath)),
  "Home inline signature form must be removed — the petition flow now lives only at /petition.",
);
assert(
  !existsSync(join(root, "src/components/home/inline-signature")),
  "src/components/home/inline-signature must be removed along with the inline form.",
);

const sectionSource = read("src/components/home/HomeCtaSection.tsx");
for (const banned of [
  "HomeInlineSignatureForm",
  "onSignatureCountChange",
  "inline-signature",
  "validateSignatureForm",
  "submitSignatureForm",
]) {
  assert(
    !sectionSource.includes(banned),
    `HomeCtaSection must not reference the removed inline form: found ${banned}.`,
  );
}

// 부분문자열 검사만으로는 주석·죽은 변수에 "/petition" 텍스트만 남아도 통과한다.
// 실제 <a>/<EditableLink> 태그 블록 안에서 href를 찾아야 한다 — 주석은 먼저 제거한다.
const sourceWithoutComments = sectionSource
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
  "HomeCtaSection must render a working <a>/<EditableLink> tag whose href/defaultHref is literally \"/petition\" — a comment or dead reference does not count.",
);

const clientSource = read("src/components/home/HomeClient.tsx");
assert(
  !clientSource.includes("onSignatureCountChange"),
  "HomeClient must not wire onSignatureCountChange into HomeCtaSection anymore.",
);

console.log("Home CTA refactor checks passed.");
