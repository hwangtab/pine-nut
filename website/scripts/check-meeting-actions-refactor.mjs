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

for (const path of [
  "src/lib/actions/meetings/types.ts",
  "src/lib/actions/meetings/form.ts",
  "src/lib/actions/meetings/children.ts",
  "src/lib/actions/meetings/revalidation.ts",
  "src/lib/actions/meetings/mutations.ts",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const entrySource = read("src/lib/actions/meetings.ts");
assert(
  entrySource.includes("@/lib/actions/meetings/mutations"),
  "meeting action entrypoint must import meeting mutations.",
);
for (const expected of [
  "createMeeting",
  "updateMeeting",
  "deleteMeeting",
  "restoreMeeting",
]) {
  assert(entrySource.includes(expected), `meeting action entrypoint must delegate ${expected}.`);
}
for (const removedResponsibility of [
  "redirect",
  "revalidatePath",
  "getAuthenticatedActionClient",
  "logAudit",
  ".from(",
  "validateMeetingForm",
  "replaceChildren",
]) {
  assert(!entrySource.includes(removedResponsibility), `meeting action entrypoint should not own ${removedResponsibility}.`);
}

const entryLines = entrySource.trimEnd().split("\n").length;
assert(entryLines <= 40, `meeting action entrypoint should stay thin, got ${entryLines} lines.`);

const formSource = read("src/lib/actions/meetings/form.ts");
for (const expected of [
  "validateMeetingForm",
  "friendlyMeetingError",
  "parseJsonArray",
  "ParsedMeetingForm",
]) {
  assert(formSource.includes(expected), `meeting form module must own ${expected}.`);
}

const childSource = read("src/lib/actions/meetings/children.ts");
for (const expected of [
  "replaceMeetingChildren",
  "meeting_attendees",
  "meeting_agendas",
  "meeting_decisions",
  "meeting_action_items",
]) {
  assert(childSource.includes(expected), `meeting children module must own ${expected}.`);
}

const mutationSource = read("src/lib/actions/meetings/mutations.ts");
for (const expected of [
  "redirect",
  "requireEditor",
  "logAudit",
  "replaceMeetingChildren",
  "revalidateMeetingPaths",
]) {
  assert(mutationSource.includes(expected), `meeting mutations must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"meeting-actions:refactor:check"'),
  "package.json must expose meeting-actions:refactor:check.",
);

console.log("Meeting actions refactor checks passed.");
