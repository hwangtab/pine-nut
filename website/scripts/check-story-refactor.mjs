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

const sectionFiles = [
  "src/components/story/StoryReasonsSection.tsx",
  "src/components/story/StoryBattleSection.tsx",
  "src/components/story/StoryDemandsSection.tsx",
  "src/components/story/StoryTransportSection.tsx",
  "src/components/story/EnglishStoryReasonsSection.tsx",
  "src/components/story/EnglishStoryBattleSection.tsx",
  "src/components/story/EnglishStoryDemandsSection.tsx",
  "src/components/story/EnglishStoryTransportSection.tsx",
  "src/components/story/index.ts",
];

for (const file of sectionFiles) {
  assert(existsSync(join(root, file)), `${file} must exist after story section split.`);
}

for (const file of sectionFiles.filter((file) => file.endsWith(".tsx"))) {
  const source = read(file);
  assert(source.startsWith('"use client";'), `${file} must keep the client component boundary.`);
  assert(
    /export function (English)?Story[A-Z][A-Za-z]+Section/.test(source),
    `${file} must export a story section component.`,
  );
}

const indexSource = read("src/components/story/index.ts");
for (const exportName of [
  "StoryReasonsSection",
  "StoryBattleSection",
  "StoryDemandsSection",
  "StoryTransportSection",
  "EnglishStoryReasonsSection",
  "EnglishStoryBattleSection",
  "EnglishStoryDemandsSection",
  "EnglishStoryTransportSection",
]) {
  assert(indexSource.includes(exportName), `components/story index must export ${exportName}.`);
}

for (const appFile of [
  "src/app/story/StorySectionsClient.tsx",
  "src/app/en/story/EnglishStorySectionsClient.tsx",
]) {
  const source = read(appFile);
  assert(
    source.includes('from "@/components/story"'),
    `${appFile} must re-export story sections from components/story.`,
  );
  assert(!source.includes("EditableList"), `${appFile} must not contain section implementation.`);
  assert(!source.includes("EditableImage"), `${appFile} must not contain section implementation.`);
  assert(!source.includes("export function"), `${appFile} must not define section functions.`);
}

console.log("Story refactor checks passed.");
