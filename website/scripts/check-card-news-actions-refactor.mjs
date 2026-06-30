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

const mainPath = "src/components/CardNews.tsx";
const modulePaths = [
  "src/components/card-news/card-list.ts",
  "src/components/card-news/useCardNewsActions.ts",
  "src/components/card-news/CardWithActions.tsx",
  "src/components/card-news/CardActionButton.tsx",
];

for (const modulePath of modulePaths) {
  assert(existsSync(join(root, modulePath)), `${modulePath} must exist.`);
}

const mainSource = read(mainPath);
assert(
  mainSource.trim().split(/\r?\n/).length <= 55,
  "CardNews.tsx must stay a small orchestration component.",
);

for (const required of [
  "buildCardList",
  "CardWithActions",
  "CardNewsEditControls",
  "useAdminEdit",
]) {
  assert(mainSource.includes(required), `CardNews.tsx must include ${required}.`);
}

for (const banned of [
  "useRef",
  "useCallback",
  "toPng",
  "navigator",
  "document.createElement",
  "alert(",
  "EditableText",
  "SITE_URL",
]) {
  assert(!mainSource.includes(banned), `CardNews.tsx must not own ${banned}.`);
}

const hookSource = read("src/components/card-news/useCardNewsActions.ts");
for (const required of [
  "toPng",
  "events.cardNewsDownload",
  "events.shareClick",
  "navigator.clipboard",
  "navigator.share",
  "SITE_URL",
  "handleDownload",
  "handleCopyLink",
  "handleShare",
]) {
  assert(hookSource.includes(required), `useCardNewsActions.ts must contain ${required}.`);
}

const cardSource = read("src/components/card-news/CardWithActions.tsx");
for (const required of [
  "useRef",
  "useCardNewsActions",
  "CardActionButton",
  "EditableText",
  "card.Component",
]) {
  assert(cardSource.includes(required), `CardWithActions.tsx must contain ${required}.`);
}

const listSource = read("src/components/card-news/card-list.ts");
for (const required of ["Card1", "Card2", "Card3", "Card4", "Card5", "buildCardList"]) {
  assert(listSource.includes(required), `card-list.ts must contain ${required}.`);
}

console.log("Card news actions refactor checks passed.");
