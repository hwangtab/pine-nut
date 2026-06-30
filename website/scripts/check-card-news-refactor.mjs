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

const cardFiles = [
  "src/components/card-news/cards/Card1.tsx",
  "src/components/card-news/cards/Card2.tsx",
  "src/components/card-news/cards/Card3.tsx",
  "src/components/card-news/cards/Card4.tsx",
  "src/components/card-news/cards/Card5.tsx",
  "src/components/card-news/cards/CardNewsChrome.tsx",
];

for (const file of cardFiles) {
  assert(existsSync(join(root, file)), `${file} must exist after card news split.`);
}

for (const file of cardFiles) {
  const source = read(file);
  assert(source.startsWith('"use client";'), `${file} must keep the client boundary.`);
}

const chromeSource = read("src/components/card-news/cards/CardNewsChrome.tsx");
for (const exportName of ["Watermark", "PatternOverlay", "CardNewsCardComponent"]) {
  assert(chromeSource.includes(exportName), `CardNewsChrome must export ${exportName}.`);
}

for (let index = 1; index <= 5; index += 1) {
  const source = read(`src/components/card-news/cards/Card${index}.tsx`);
  assert(source.includes(`export function Card${index}`), `Card${index} must export its card component.`);
  assert(source.includes("CardNewsChrome"), `Card${index} must use shared card chrome.`);
}

const barrelSource = read("src/components/card-news/CardNewsCards.tsx");
for (const exportName of ["Card1", "Card2", "Card3", "Card4", "Card5"]) {
  assert(barrelSource.includes(exportName), `CardNewsCards barrel must export ${exportName}.`);
}
assert(
  !barrelSource.includes("EditableList") && !barrelSource.includes("EditableText"),
  "CardNewsCards.tsx must be a barrel, not the card implementation.",
);
assert(
  !barrelSource.includes("export function Card"),
  "CardNewsCards.tsx must not define card components directly.",
);

console.log("Card news refactor checks passed.");
