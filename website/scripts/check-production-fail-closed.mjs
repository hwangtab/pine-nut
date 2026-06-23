import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const timelineData = readFileSync(
  join(root, "src", "lib", "data", "timeline.ts"),
  "utf8",
);
const englishPetitionPage = readFileSync(
  join(root, "src", "app", "en", "petition", "page.tsx"),
  "utf8",
);
const petitionSignatureSummaryHook = readFileSync(
  join(root, "src", "components", "petition", "usePetitionSignatureSummary.ts"),
  "utf8",
);

assert(
  timelineData.includes("const IS_PRODUCTION"),
  "timeline data access must distinguish production from development.",
);
assert(
  timelineData.includes("function fallbackOrThrow"),
  "timeline data access must fail closed in production and use fallback only in development.",
);
assert(
  !/if\s*\(\s*!supabase\s*\)\s*{\s*return\s+fallbackTimeline\s*;\s*}/s.test(
    timelineData,
  ),
  "published timeline must not unconditionally fall back when Supabase is missing.",
);
assert(
  !/return\s+fallbackTimeline\s*;\s*$/m.test(timelineData),
  "published timeline must not unconditionally fall back on Supabase errors.",
);
assert(
  !/return\s+buildFallbackTimelineResult\(from,\s*to,\s*query\)\s*;/.test(
    timelineData,
  ),
  "admin timeline must not unconditionally show editable-looking fallback data.",
);
assert(
  englishPetitionPage.includes("usePetitionSignatureSummary"),
  "English petition page must use the shared signature summary hook.",
);
assert(
  petitionSignatureSummaryHook.includes('console.error("Failed to fetch signatures:"'),
  "Shared petition signature fetch must catch service failures instead of creating unhandled rejections.",
);

console.log("Production fail-closed checks passed.");
