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

const mainPath = "src/components/ShareButtons.tsx";
const modulePaths = [
  "src/components/share-buttons/types.ts",
  "src/components/share-buttons/useShareButtons.ts",
  "src/components/share-buttons/ShareButton.tsx",
  "src/components/share-buttons/ShareButtonLabel.tsx",
  "src/components/share-buttons/ShareCopiedToast.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 85,
  "ShareButtons.tsx must stay a small orchestration component.",
);

for (const required of [
  "useShareButtons",
  "ShareButton",
  "ShareButtonLabel",
  "ShareCopiedToast",
  "MessageCircle",
  "Twitter",
  "Facebook",
]) {
  assert(mainSource.includes(required), `ShareButtons.tsx must include ${required}.`);
}

for (const banned of [
  "useState",
  "navigator",
  "window.open",
  "document.createElement",
  "setTimeout",
  "EditableText",
]) {
  assert(!mainSource.includes(banned), `ShareButtons.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/share-buttons/useShareButtons.ts");
for (const required of [
  "useState",
  "navigator.share",
  "navigator.clipboard",
  "window.open",
  "document.createElement",
  "handleKakao",
  "handleTwitter",
  "handleFacebook",
  "handleCopyUrl",
]) {
  assert(hookSource.includes(required), `useShareButtons.ts must contain ${required}.`);
}

const labelSource = read("src/components/share-buttons/ShareButtonLabel.tsx");
for (const required of ["EditableText", "contentPrefix", "defaultValue"]) {
  assert(labelSource.includes(required), `ShareButtonLabel.tsx must contain ${required}.`);
}

const toastSource = read("src/components/share-buttons/ShareCopiedToast.tsx");
assert(
  toastSource.includes("ShareButtonLabel") && labelSource.includes("복사되었습니다"),
  "ShareCopiedToast.tsx must render the shared default copied label.",
);

console.log("ShareButtons refactor checks passed.");
