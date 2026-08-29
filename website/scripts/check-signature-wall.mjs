import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
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

const componentPath = "src/components/petition/SignatureWall.tsx";
const hookPath = "src/components/petition/usePetitionSignatureSummary.ts";

assert(existsSync(join(root, componentPath)), `${componentPath} must exist (Task 11: SignatureWall).`);
assert(existsSync(join(root, hookPath)), `${hookPath} must exist.`);
assert(
  !existsSync(join(root, "src/components/petition/RecentSignatures.tsx")),
  "RecentSignatures.tsx must be deleted — SignatureWall replaces it (Task 11).",
);

const source = read(componentPath);

assert(source.startsWith('"use client";'), "SignatureWall.tsx must be a client component.");
assert(!/framer-motion/.test(source), "SignatureWall must not import framer-motion.");

// ── Props contract: SignatureWallProps must expose exactly the four fields
// Task 12 will pass in, with the right primitive types.
const propsMatch = source.match(/interface SignatureWallProps\s*\{([\s\S]*?)\}/);
assert(propsMatch, "SignatureWall.tsx must declare `interface SignatureWallProps`.");
const propsBody = propsMatch[1];
for (const [name, type] of [
  ["heading", "string"],
  ["emptyText", "string"],
  ["moreText", "string"],
]) {
  const fieldRegex = new RegExp(`${name}\\s*:\\s*${type}\\s*;`);
  assert(fieldRegex.test(propsBody), `SignatureWallProps must declare \`${name}: ${type};\`.`);
}
assert(
  /refreshToken\?\s*:\s*number\s*;/.test(propsBody),
  "SignatureWallProps must declare optional `refreshToken?: number;`.",
);
const propFieldCount = (propsBody.match(/^\s*\w+\??\s*:/gm) ?? []).length;
assert(
  propFieldCount === 4,
  `SignatureWallProps must declare exactly 4 fields (heading, emptyText, moreText, refreshToken), found ${propFieldCount}.`,
);

assert(
  /export default function SignatureWall/.test(source),
  "SignatureWall.tsx must default-export a function component named SignatureWall.",
);

// ── Personal-info discipline: WallEntry only carries name/regionTop/
// regionSub/createdAt (spec §6 — email/message/affiliation/ip_hash/id must
// never reach this screen). Extract every `entry.<field>` access actually
// used in the file and assert it's a subset of the four allowed fields —
// a substring check for "email" alone would miss a renamed destructure
// (`const { message } = entry`), so this also checks destructuring patterns.
const allowedEntryFields = new Set(["name", "regionTop", "regionSub", "createdAt"]);
const dotAccessFields = [...source.matchAll(/\bentry\.(\w+)/g)].map((m) => m[1]);
for (const field of dotAccessFields) {
  assert(
    allowedEntryFields.has(field),
    `SignatureWall.tsx must not read WallEntry.${field} — only name/regionTop/regionSub/createdAt may reach the screen.`,
  );
}
// Word-bounded (not plain substring) so identifiers like `liveMessage` or
// `loadMoreError` don't false-positive on "message"/"more".
const destructureMatch = source.match(/const\s*\{\s*([^}]*)\}\s*=\s*entry\b/);
const destructuredFields = destructureMatch
  ? destructureMatch[1].split(",").map((s) => s.trim().split(":")[0].trim()).filter(Boolean)
  : [];
for (const field of destructuredFields) {
  assert(
    allowedEntryFields.has(field),
    `SignatureWall.tsx must not destructure WallEntry.${field} — only name/regionTop/regionSub/createdAt may reach the screen.`,
  );
}
for (const banned of ["email", "affiliation", "ip_hash", "namePublic"]) {
  const pattern = new RegExp(`\\b${banned}\\b`, "i");
  assert(
    !pattern.test(source),
    `SignatureWall.tsx must not reference "${banned}" — that field must never reach this component or the DOM.`,
  );
}

// ── Cursor pagination: nextCursor === null must hide the "more" button so
// a spent cursor never fires another empty request. Verify the real
// contract (hasMore derived from nextCursor, and gating the button render),
// not just that the string "nextCursor" appears somewhere.
assert(
  /setHasMore\(page\.nextCursor !== null\)/.test(source),
  "SignatureWall.tsx must derive hasMore from `page.nextCursor !== null` on every page load (first page and load-more).",
);
const hasMoreOccurrences = (source.match(/setHasMore\(page\.nextCursor !== null\)/g) ?? []).length;
assert(
  hasMoreOccurrences >= 2,
  "SignatureWall.tsx must set hasMore from nextCursor in both the first-page load and the load-more handler.",
);
assert(
  /\{hasMore\s*&&/.test(source),
  'SignatureWall.tsx must gate the "more" button\'s render on `hasMore` so it disappears once nextCursor is null.',
);

// ── refreshToken: changing it must reload from page 1 (replacing entries,
// not appending) — verified as a real dependency-array + replace-not-append
// check, not just that the identifier appears in the file.
const effectMatch = source.match(/useEffect\(\(\)\s*=>\s*\{[\s\S]*?\},\s*\[([^\]]*)\]\s*\);/);
assert(effectMatch, "SignatureWall.tsx must call the first-page loader inside a useEffect.");
assert(
  /\brefreshToken\b/.test(effectMatch[1]),
  "The first-page-loading useEffect's dependency array must include `refreshToken` so a changed token reloads page 1.",
);
assert(
  /setEntries\(page\.entries\)/.test(source),
  "The first-page loader must replace entries with `setEntries(page.entries)` (not append) so refreshToken resets to page 1.",
);
assert(
  /setEntries\(\(current\)\s*=>\s*\[\.\.\.current,\s*\.\.\.page\.entries\]\)/.test(source),
  "The load-more handler must append with `setEntries((current) => [...current, ...page.entries])`.",
);

// ── Duplicate-guard: rapid double-clicks on "more" and a refreshToken flip
// mid-flight must not double-append. Require both an early-exit guard on
// the load-more handler and a generation/version ref that response
// application checks before writing state (the actual anti-race mechanism,
// not just a loading boolean that only helps after one re-render).
assert(
  /if\s*\(!cursor\s*\|\|\s*loadingMore[^)]*\)\s*return;/.test(source),
  "handleLoadMore must bail out early when already loading or no cursor is available.",
);
assert(
  /useRef\(0\)/.test(source) || /useRef<number>\(0\)/.test(source),
  "SignatureWall.tsx must keep a numeric generation ref to detect stale responses (refreshToken racing a load-more).",
);

// The generation guard must protect BOTH call sites independently — a
// global "does this pattern appear anywhere" check would still pass if only
// one of the two functions' stale-response guard were deleted (the other's
// occurrence keeps the naive check green). Extract each function's own body
// and require the guard to appear before that function's own state-write,
// so removing either one's guard fails for the right reason.
const loadFirstPageMatch = source.match(
  /const loadFirstPage = useCallback\(async \(\) => \{([\s\S]*?)\n {2}\}, \[\]\);/,
);
assert(loadFirstPageMatch, "Could not isolate loadFirstPage's body for the stale-response guard check.");
const loadFirstPageBody = loadFirstPageMatch[1];
const lfpGuardIdx = loadFirstPageBody.indexOf("generation !== generationRef.current");
const lfpWriteIdx = loadFirstPageBody.indexOf("setEntries(page.entries)");
assert(
  lfpGuardIdx !== -1 && lfpWriteIdx !== -1 && lfpGuardIdx < lfpWriteIdx,
  "loadFirstPage must check `generation !== generationRef.current` and bail out BEFORE calling setEntries(page.entries), so a stale first-page response (superseded by a newer refreshToken-triggered load) is discarded.",
);

const loadMoreMatch = source.match(
  /const handleLoadMore = useCallback\(async \(\) => \{([\s\S]*?)\n {2}\}, \[cursor, loadingMore\]\);/,
);
assert(loadMoreMatch, "Could not isolate handleLoadMore's body for the stale-response guard check.");
const loadMoreBody = loadMoreMatch[1];
const lmGuardIdx = loadMoreBody.indexOf("generation !== generationRef.current");
const lmWriteIdx = loadMoreBody.indexOf("setEntries((current)");
assert(
  lmGuardIdx !== -1 && lmWriteIdx !== -1 && lmGuardIdx < lmWriteIdx,
  "handleLoadMore must check `generation !== generationRef.current` and bail out BEFORE appending via setEntries((current) => ...), so a load-more response that resolves after a refreshToken reset already replaced page 1 does not get appended on top of it.",
);

// ── Error states: a failed fetch must not leave the screen silently empty.
// Require distinct, non-empty error copy for the initial-load failure and
// a way to retry, plus an alert role so assistive tech announces it (not
// just a console.error, which is invisible on screen).
assert(
  /role=["']alert["']/.test(source),
  "SignatureWall.tsx must render an element with role=\"alert\" for error states — a silent empty screen is not acceptable.",
);
const errorTextMatch = source.match(/const WALL_ERROR_TEXT\s*=\s*"([^"]{5,})"/);
assert(errorTextMatch, 'SignatureWall.tsx must define non-trivial WALL_ERROR_TEXT copy (5+ chars).');
assert(
  /onClick=\{loadFirstPage\}/.test(source),
  "The initial-load error state must offer a retry button wired to loadFirstPage.",
);

// ── Accessibility: semantic list, live-region status announcement, and
// button loading state.
assert(/<ul\b/.test(source) && /<li\b/.test(source), "Entries must render in a semantic <ul>/<li> list.");
assert(/aria-live=["']polite["']/.test(source), "SignatureWall.tsx must announce updates via an aria-live region.");
assert(
  /aria-busy=\{loadingMore\}/.test(source),
  "The more button must expose aria-busy={loadingMore}.",
);
assert(
  /disabled=\{loadingMore\}/.test(source),
  "The more button must be disabled while loadingMore is true.",
);

// ── Date rendering: Korean locale, ISO createdAt preserved in <time datetime>.
assert(
  /toLocaleDateString\("ko-KR"/.test(source),
  "Signature dates must render via toLocaleDateString(\"ko-KR\", ...).",
);
assert(
  /<time dateTime=\{entry\.createdAt\}>/.test(source),
  "Each entry must render <time dateTime={entry.createdAt}> so the raw ISO value stays in the DOM alongside the formatted display.",
);

// ── Color-role discipline: --color-warm is CTA/signature-button only.
// "더 보기" is a pagination utility action, not a conversion CTA — it must
// not borrow the CTA color.
assert(
  !/--color-warm/.test(source),
  "SignatureWall.tsx must not use --color-warm — that's reserved for CTA/signature-button actions, and \"더 보기\" is a secondary utility action.",
);

// ---------------------------------------------------------------------------
// usePetitionSignatureSummary.ts — rewritten return-shape contract
// ---------------------------------------------------------------------------
const hookSource = read(hookPath);

assert(hookSource.startsWith('"use client";'), "usePetitionSignatureSummary.ts must be a client hook.");
assert(
  /import type \{ SignatureSummary \} from "@\/lib\/signatures\/api\/store";/.test(hookSource),
  "usePetitionSignatureSummary.ts must import the shared SignatureSummary type.",
);

const returnMatch = hookSource.match(/return \{([^}]*)\};/);
assert(returnMatch, "usePetitionSignatureSummary must have a `return { ... };` statement.");
const returnedKeys = returnMatch[1]
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
assert(
  returnedKeys.length === 3 &&
    returnedKeys.includes("summary") &&
    returnedKeys.includes("loadingSummary") &&
    returnedKeys.includes("refreshSummary"),
  `usePetitionSignatureSummary must return exactly { summary, loadingSummary, refreshSummary }, found { ${returnedKeys.join(", ")} }.`,
);

// The old signatures[]/signatureCount/setSignatureCount shape must be gone —
// a stale re-export of the old names would let a caller silently keep using
// the removed rank/list behavior.
for (const banned of ["signatureCount", "setSignatureCount", "loadingSignatures"]) {
  assert(
    !hookSource.includes(banned),
    `usePetitionSignatureSummary.ts must not reference the old shape's \`${banned}\`.`,
  );
}

// ---------------------------------------------------------------------------
// No leftover references to the deleted component anywhere in src/. A plain
// recursive walk (no shell-out) — every non-comment line mentioning
// "RecentSignatures" (an import, a JSX usage, a re-export) means something
// still expects the deleted file to exist.
// ---------------------------------------------------------------------------
function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

const liveReferences = [];
for (const file of walk(join(root, "src"))) {
  const relPath = relative(root, file);
  const lines = read(relPath).split("\n");
  lines.forEach((line, i) => {
    if (!line.includes("RecentSignatures")) return;
    const trimmed = line.trim();
    const isComment =
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*") ||
      trimmed.startsWith("{/*"); // JSX comment
    if (!isComment) {
      liveReferences.push(`${relPath}:${i + 1}: ${trimmed}`);
    }
  });
}
assert(
  liveReferences.length === 0,
  `Found live (non-comment) references to deleted RecentSignatures: ${JSON.stringify(liveReferences)}`,
);

console.log("SignatureWall checks passed.");
