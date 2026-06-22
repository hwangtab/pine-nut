import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const validator = readFileSync(
  join(root, "src", "lib", "validation", "url.ts"),
  "utf8",
);

assert(
  validator.includes("NEXT_PUBLIC_SUPABASE_URL"),
  "image URL validation must allow the configured Supabase Storage host.",
);
assert(
  validator.includes("configuredSupabaseHostname"),
  "image URL validation must derive the Supabase hostname once and add it to the allowlist.",
);

console.log("Image host configuration checks passed.");
