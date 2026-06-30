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

const clientPaths = [
  "src/app/news/NewsListClient.tsx",
  "src/app/en/news/EnglishNewsListClient.tsx",
];
const componentPaths = [
  "src/components/news-list/news-list-config.ts",
  "src/components/news-list/NewsListPage.tsx",
  "src/components/news-list/NewsCategoryFilter.tsx",
  "src/components/news-list/NewsCard.tsx",
  "src/components/news-list/NewsGrid.tsx",
];

for (const componentPath of componentPaths) {
  assert(existsSync(join(root, componentPath)), `${componentPath} must exist.`);
}

for (const clientPath of clientPaths) {
  const source = read(clientPath);
  assert(
    source.trim().split(/\r?\n/).length <= 45,
    `${clientPath} must stay a thin locale adapter.`,
  );
  assert(source.includes("NewsListPage"), `${clientPath} must render NewsListPage.`);
  assert(source.includes("newsListConfig"), `${clientPath} must pass a locale newsListConfig.`);
  for (const banned of [
    "useState",
    "Link",
    "Image",
    "SubHero",
    "EditableText",
    "categoryFilterStyles",
    "categoryTagColors",
    "filteredItems",
  ]) {
    assert(!source.includes(banned), `${clientPath} must not duplicate ${banned}.`);
  }
}

const configSource = read("src/components/news-list/news-list-config.ts");
for (const required of [
  "koreanNewsListConfig",
  "englishNewsListConfig",
  "categoryFilterStyles",
  "categoryTagColors",
  "dateLocale",
  "news.hero.title",
  "en.news.hero.title",
]) {
  assert(configSource.includes(required), `news-list-config.ts must contain ${required}.`);
}

const pageSource = read("src/components/news-list/NewsListPage.tsx");
for (const required of [
  "useState",
  "SubHero",
  "NewsCategoryFilter",
  "NewsGrid",
  "filteredItems",
]) {
  assert(pageSource.includes(required), `NewsListPage.tsx must contain ${required}.`);
}

const cardSource = read("src/components/news-list/NewsCard.tsx");
for (const required of ["Image", "Newspaper", "dateLocale", "categoryTagColors", "detailPathPrefix"]) {
  assert(cardSource.includes(required), `NewsCard.tsx must contain ${required}.`);
}
assert(!cardSource.includes("<svg"), "NewsCard must not use inline SVG for the empty thumbnail icon.");

console.log("News list refactor checks passed.");
