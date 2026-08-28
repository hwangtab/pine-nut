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

const componentPath = "src/components/petition/PetitionProgress.tsx";

assert(
  existsSync(join(root, componentPath)),
  `${componentPath} must exist (Task 9: PetitionProgress).`,
);

const source = read(componentPath);

assert(source.startsWith('"use client";'), "PetitionProgress.tsx must be a client component.");

assert(
  !/framer-motion/.test(source),
  "PetitionProgress must not import framer-motion — a CSS transition is enough for a fill bar (Task 9 constraint).",
);

// ── Props contract: PetitionProgressProps must expose exactly the five
// fields Task 12 will pass in, with the right primitive types. A renamed or
// mistyped field breaks the page assembly silently (TS would catch it only
// once Task 12 exists and imports this component).
const interfaceMatch = source.match(
  /interface PetitionProgressProps\s*\{([\s\S]*?)\}/,
);
assert(interfaceMatch, "PetitionProgress.tsx must declare `interface PetitionProgressProps`.");
const interfaceBody = interfaceMatch[1];
for (const field of [
  ["count", "number"],
  ["goal", "number"],
  ["regionCount", "number"],
  ["recent24h", "number"],
  ["loading", "boolean"],
]) {
  const [name, type] = field;
  const fieldRegex = new RegExp(`${name}\\s*:\\s*${type}\\s*;`);
  assert(
    fieldRegex.test(interfaceBody),
    `PetitionProgressProps must declare \`${name}: ${type};\`.`,
  );
}
// Exactly five fields — a stray sixth prop would go unconsumed by Task 12,
// and dropping one would break the contract this file heading documents.
const fieldCount = (interfaceBody.match(/^\s*\w+\s*:/gm) ?? []).length;
assert(
  fieldCount === 5,
  `PetitionProgressProps must declare exactly 5 fields, found ${fieldCount}.`,
);

assert(
  /export default function PetitionProgress/.test(source),
  "PetitionProgress.tsx must default-export a function component named PetitionProgress.",
);

// ── The real contract: percentage math, not just its presence as text.
// Extract the `const pct = <expr>;` line and actually evaluate it for a
// matrix of inputs — this is the same class of bug ("goal 0 divides by
// zero", "goal exceeded breaks the bar past 100%") that a string-presence
// check would happily let through.
const pctMatch = source.match(/const pct\s*=\s*([^;]+);/);
assert(pctMatch, "PetitionProgress.tsx must compute `const pct = ...;` from count/goal.");
let calcPct;
try {
  // Trusted input only: pctMatch[1] comes from this repo's own source file
  // (read above), never from user/network input. This is a dev-time guard
  // script, not a runtime code path.
  calcPct = new Function("count", "goal", `return (${pctMatch[1]});`);
} catch (err) {
  throw new Error(`pct expression failed to parse as JS: ${err.message}`);
}

const cases = [
  { count: 0, goal: 10000, expected: 0, label: "count 0" },
  { count: 5000, goal: 10000, expected: 50, label: "halfway" },
  { count: 10000, goal: 10000, expected: 100, label: "exactly at goal" },
  { count: 15000, goal: 10000, expected: 100, label: "goal exceeded — must cap at 100, not 150" },
  { count: 100, goal: 0, expected: 0, label: "goal 0 — must not divide by zero / NaN" },
];
for (const { count, goal, expected, label } of cases) {
  let result;
  try {
    result = calcPct(count, goal);
  } catch (err) {
    throw new Error(`pct(count=${count}, goal=${goal}) [${label}] threw: ${err.message}`);
  }
  assert(
    Number.isFinite(result),
    `pct(count=${count}, goal=${goal}) [${label}] must be a finite number, got ${result}.`,
  );
  assert(
    result === expected,
    `pct(count=${count}, goal=${goal}) [${label}] must equal ${expected}, got ${result}.`,
  );
}

// ── Accessibility: the bar must expose its value to assistive tech, wired
// to the real computed value (not a hardcoded number that could drift from
// the visual fill).
assert(
  /role=["']progressbar["']/.test(source),
  'PetitionProgress.tsx must render an element with role="progressbar".',
);
assert(
  /aria-valuenow=\{pct\}/.test(source),
  "aria-valuenow must be wired to the computed `pct` value, not a literal.",
);
assert(
  /aria-valuemin=\{0\}/.test(source) && /aria-valuemax=\{100\}/.test(source),
  "progressbar must declare aria-valuemin={0} and aria-valuemax={100}.",
);

// ── Color-role discipline: --color-warm is the CTA/signature-button color
// exclusively (see globals.css + CLAUDE.md). The progress bar is not a call
// to action, so warm must not leak in as a fill/accent color here.
assert(
  !/--color-warm/.test(source),
  "PetitionProgress.tsx must not use --color-warm — it is reserved for CTA/signature-button actions, not the progress fill.",
);

// ── Korean thousands-separator locale formatting for every displayed count.
for (const expr of [
  "count.toLocaleString(\"ko-KR\")",
  "goal.toLocaleString(\"ko-KR\")",
  "regionCount.toLocaleString(\"ko-KR\")",
  "recent24h.toLocaleString(\"ko-KR\")",
]) {
  assert(
    source.includes(expr),
    `PetitionProgress.tsx must format numbers with ${expr}.`,
  );
}

// ── Loading state: every displayed metric must branch on `loading`, not
// just the top-line count — a page skeleton that flashes real component
// counts while regions/recent24h are still 0 would look broken.
const loadingBranches = (source.match(/loading\s*\?/g) ?? []).length;
assert(
  loadingBranches >= 3,
  `PetitionProgress.tsx must branch on \`loading\` for all three displayed metrics (count, regionCount, recent24h) — found ${loadingBranches} \`loading ?\` branches, need >= 3.`,
);

console.log("PetitionProgress checks passed.");
