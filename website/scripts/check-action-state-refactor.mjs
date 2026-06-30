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

const statePath = "src/lib/actions/state.ts";
assert(existsSync(join(root, statePath)), "shared action state module must exist.");

const stateSource = read(statePath);
assert(stateSource.includes("ActionState"), "shared action state module must export ActionState.");

for (const path of [
  "src/lib/actions/news.ts",
  "src/lib/actions/timeline.ts",
  "src/components/admin/NewsForm.tsx",
  "src/components/admin/TimelineForm.tsx",
]) {
  const source = read(path);
  assert(source.includes("@/lib/actions/state") || source.includes("./state"), `${path} must import ActionState from the shared state module.`);
  assert(!source.includes("./news\""), `${path} must not import ActionState from news actions.`);
  assert(!source.includes("@/lib/actions/news\""), `${path} must not import ActionState from news actions.`);
}

const newsSource = read("src/lib/actions/news.ts");
assert(!newsSource.includes("export type ActionState"), "news actions must not define ActionState.");

console.log("Action state refactor checks passed.");
