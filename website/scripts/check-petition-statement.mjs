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

const componentPath = "src/components/petition/PetitionStatement.tsx";
const dataPath = "src/components/petition/copy/statement.ts";
const formCopyPath = "src/components/petition/copy/form.ts";

for (const p of [componentPath, dataPath, formCopyPath]) {
  assert(existsSync(join(root, p)), `${p} must exist.`);
}

const componentSource = read(componentPath);
const dataSource = read(dataPath);
const formCopySource = read(formCopyPath);

assert(componentSource.startsWith('"use client";'), "PetitionStatement.tsx must be a client component.");
assert(
  /export default function PetitionStatement\s*\(\s*\)/.test(componentSource),
  "PetitionStatement.tsx must default-export `function PetitionStatement()` taking no props.",
);
assert(
  /import\s*\{[^}]*EditableText[^}]*\}\s*from\s*["']@\/components\/editable["']/.test(componentSource),
  "PetitionStatement.tsx must render prose through EditableText from @/components/editable.",
);

// ── The load-bearing check: the consent checkbox in copy/form.ts quotes this
// statement's title verbatim (「...」). If the statement's actual title ever
// drifts from that quotation, the consent citation becomes inaccurate — a
// real trust problem for a document people are legally consenting to. We
// don't hardcode the expected string here (that would just be duplicating
// the drift risk into the guard); instead we extract the live quotation from
// form.ts and assert the statement's data module contains that exact
// substring, so either file changing out of sync with the other goes RED.
const titleQuoteMatch = formCopySource.match(/「([^」]+)」/);
assert(titleQuoteMatch, "copy/form.ts must still quote the statement title in 「...」 guillemets.");
const quotedTitle = titleQuoteMatch[1];
assert(
  dataSource.includes(quotedTitle),
  `copy/statement.ts must contain the statement title exactly as quoted by the consent checkbox in copy/form.ts: "${quotedTitle}".`,
);

// ── Structure: 4 prose blocks + 5 stat cards + 2 closing lines, as data —
// not just markup that happens to contain the right words. Extract the
// arrays' declared shape by counting object literals between the array's
// opening and its matching top-level closing bracket, keyed on unambiguous
// field names so this doesn't depend on formatting.
function countArrayEntries(source, exportName, entryKeyField) {
  const re = new RegExp(`export const ${exportName}[^=]*=\\s*\\[([\\s\\S]*?)\\n\\];`);
  const m = source.match(re);
  assert(m, `copy/statement.ts must export \`${exportName}\` as an array literal.`);
  const body = m[1];
  const entryMatches = body.match(new RegExp(`${entryKeyField}\\s*:`, "g")) ?? [];
  return entryMatches.length;
}

const blockCount = countArrayEntries(dataSource, "petitionStatementBlocks", "headingKey");
assert(blockCount === 4, `petitionStatementBlocks must declare exactly 4 blocks, found ${blockCount}.`);

const statCount = countArrayEntries(dataSource, "petitionStatementStats", "valueKey");
assert(statCount === 5, `petitionStatementStats must declare exactly 5 stat cards, found ${statCount}.`);

const closingCount = countArrayEntries(dataSource, "petitionStatementClosing", "key");
assert(closingCount === 2, `petitionStatementClosing must declare exactly 2 closing lines, found ${closingCount}.`);

// ── The component must actually render from the data module (not carry its
// own duplicate copy of the facts, which is exactly how facts drift).
for (const dataExport of [
  "petitionStatementBlocks",
  "petitionStatementStats",
  "petitionStatementClosing",
]) {
  assert(
    new RegExp(`\\b${dataExport}\\b`).test(componentSource),
    `PetitionStatement.tsx must import and render \`${dataExport}\` from ./copy/statement — copy must live in one place.`,
  );
  assert(
    new RegExp(`${dataExport}\\b[^;]{0,40}?\\.map\\(`).test(componentSource),
    `PetitionStatement.tsx must render \`${dataExport}\` via .map() (optionally through .slice()), not hand-duplicate its entries as literal JSX.`,
  );
}

// ── contentKey namespace + uniqueness. A key outside petition.statement.*
// either collides with another page's CMS content or silently breaks the
// admin edit surface's page/section scoping. A duplicate key means two
// fields overwrite each other in the CMS.
const allKeys = [
  ...dataSource.matchAll(/(?:key|headingKey|valueKey|labelKey)\s*:\s*"([^"]+)"/g),
].map((m) => m[1]);
assert(allKeys.length > 0, "copy/statement.ts must declare contentKeys for its editable fields.");
for (const key of allKeys) {
  assert(
    key.startsWith("petition.statement."),
    `contentKey "${key}" must live under the petition.statement.* namespace.`,
  );
}
const uniqueKeys = new Set(allKeys);
assert(
  uniqueKeys.size === allKeys.length,
  `copy/statement.ts must not reuse a contentKey — found ${allKeys.length} keys but only ${uniqueKeys.size} unique (a duplicate silently overwrites CMS content).`,
);

// ── Facts that must never drift. Each anchor pairs the number with its unit
// or immediate context (not a bare number) so a coincidental substring match
// elsewhere in the file can't produce a false pass — the exact weakness a
// prior guard in this codebase was flagged for (bare "51" also matches
// inside "1,551").
const factAnchors = [
  [/1937년/, "숲의 시작 연도(1937년)"],
  [/2017년[\s\S]{0,20}10대 명품숲/, "산림청 2017년 10대 명품숲 선정"],
  [/100대 명품숲/, "현재 대한민국 100대 명품숲 포함"],
  [/국내 잣 생산량의 62%/, "국내 잣 생산량 62%"],
  [/600MW/, "600MW 규모 양수발전소"],
  [/11만 1,999그루/, "사라질 나무 111,999그루(본문 표기)"],
  [/111,999/, "사라질 나무 111,999(숫자 카드 표기)"],
  [/2,256그루/, "이설도로 공사로 이미 쓰러진 2,256그루"],
  [/51가구/, "물에 잠기거나 떠나야 하는 51가구"],
  [/8년째/, "주민들의 8년째 보전 활동"],
  [/왕복효율[\s\S]{0,20}80%/, "양수발전 왕복효율 약 80%"],
  [/멸종위기 야생생물 Ⅰ급[\s\S]{0,10}천연기념물[\s\S]{0,10}산양[과와][\s\S]{0,5}수달/, "산양·수달 = 멸종위기 Ⅰ급·천연기념물"],
  [/멸종위기[\s\S]{0,5}Ⅱ급[\s\S]{0,10}담비/, "담비 = 멸종위기 Ⅱ급"],
];
for (const [pattern, label] of factAnchors) {
  assert(pattern.test(dataSource), `copy/statement.ts is missing the required fact: ${label} (pattern: ${pattern}).`);
}

// ── Ministry-name discipline: if a ministry is ever named in the statement,
// it must be the current one, not the 2025-notice ministry (see
// ministry-naming-rule memory: 2025 고시=산업통상자원부, 현재=기후에너지환경부).
assert(
  !dataSource.includes("산업통상자원부"),
  "copy/statement.ts must not name 산업통상자원부 (the 2025-notice ministry) — the current ministry is 기후에너지환경부, per project convention.",
);

console.log("PetitionStatement checks passed.");
