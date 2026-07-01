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

const helperPath = "src/lib/actions/auth.ts";
assert(existsSync(join(root, helperPath)), "shared action auth helper must exist.");

const helperSource = read(helperPath);
for (const exportName of [
  "requireActiveAdmin",
  "requireEditor",
  "requireOwner",
]) {
  assert(helperSource.includes(exportName), `auth helper must export ${exportName}.`);
}
assert(
  !helperSource.includes("export async function getAuthenticatedActionClient") &&
    !helperSource.includes("export async function getAuthenticatedActionContext"),
  "bare authenticated Supabase helpers must stay private to avoid bypassing admin-role checks.",
);
assert(
  helperSource.includes("createSupabaseServerClient"),
  "auth helper must be the single server-action owner of createSupabaseServerClient.",
);
assert(
  helperSource.includes('redirect("/admin/login")'),
  "auth helper must preserve the admin-login redirect boundary.",
);

for (const actionFile of [
  "src/lib/actions/news/mutations.ts",
  "src/lib/actions/timeline/mutations.ts",
  "src/lib/actions/meetings/mutations.ts",
  "src/lib/actions/meeting-attachments.ts",
  "src/lib/actions/page-content.ts",
  "src/lib/actions/media-library.ts",
]) {
  const source = read(actionFile);
  assert(
    source.includes("/actions/auth") || source.includes("./auth"),
    `${actionFile} must import shared action auth helpers.`,
  );
  assert(
    !source.includes("createSupabaseServerClient"),
    `${actionFile} must not create Supabase server clients directly.`,
  );
  assert(
    !source.includes('redirect("/admin/login")'),
    `${actionFile} must not own the admin-login redirect directly.`,
  );
  assert(
    !/async function getAuthenticatedClient/.test(source),
    `${actionFile} must not keep a local getAuthenticatedClient helper.`,
  );
}

const meetingAttachmentsSource = read("src/lib/actions/meeting-attachments.ts");
assert(
  meetingAttachmentsSource.includes("requireActiveAdmin") &&
    !meetingAttachmentsSource.includes("getAuthenticatedActionClient"),
  "meeting attachment signed URLs must require active admin membership.",
);

for (const entryFile of ["src/lib/actions/news.ts", "src/lib/actions/timeline.ts"]) {
  const source = read(entryFile);
  assert(
    !source.includes("createSupabaseServerClient"),
    `${entryFile} must not create Supabase server clients directly.`,
  );
  assert(
    !source.includes('redirect("/admin/login")'),
    `${entryFile} must not own the admin-login redirect directly.`,
  );
}

console.log("Action auth refactor checks passed.");
