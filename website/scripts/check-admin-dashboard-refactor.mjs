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
  "src/lib/data/admin-dashboard.ts",
  "src/components/admin/dashboard/AdminDashboardCards.tsx",
  "src/components/admin/dashboard/AdminDashboardGuide.tsx",
  "src/components/admin/dashboard/AdminDashboardWarnings.tsx",
  "src/components/admin/dashboard/AdminQuickActions.tsx",
  "src/components/admin/dashboard/AdminSpecialPagesNotice.tsx",
]) {
  assert(existsSync(join(root, path)), `${path} must exist.`);
}

const pageSource = read("src/app/admin/page.tsx");
for (const expected of [
  "getAdminDashboardData",
  "AdminDashboardCards",
  "AdminDashboardGuide",
  "AdminDashboardWarnings",
  "AdminQuickActions",
  "AdminSpecialPagesNotice",
]) {
  assert(pageSource.includes(expected), `admin dashboard page must compose ${expected}.`);
}

for (const removedResponsibility of [
  "createSupabaseServerClient",
  "formatSupabaseRelationWarning",
  "isMissingSupabaseRelationError",
  "getTableCountStatus",
  "supabase.from",
  "Promise.all",
  "const cards",
  "lucide-react",
]) {
  assert(!pageSource.includes(removedResponsibility), `admin dashboard page should not own ${removedResponsibility}.`);
}

const pageLines = pageSource.trimEnd().split("\n").length;
assert(pageLines <= 55, `admin dashboard page should stay orchestration-focused, got ${pageLines} lines.`);

const dataSource = read("src/lib/data/admin-dashboard.ts");
for (const expected of [
  "createSupabaseServerClient",
  "formatSupabaseRelationWarning",
  "isMissingSupabaseRelationError",
  "getTableCountStatus",
  "Promise.all",
]) {
  assert(dataSource.includes(expected), `admin dashboard data helper must own ${expected}.`);
}

const cardsSource = read("src/components/admin/dashboard/AdminDashboardCards.tsx");
for (const expected of [
  "lucide-react",
  "signatureStatus",
  "newsStatus",
  "timelineStatus",
]) {
  assert(cardsSource.includes(expected), `admin dashboard cards must own ${expected}.`);
}

const packageJson = read("package.json");
assert(
  packageJson.includes('"admin-dashboard:refactor:check"'),
  "package.json must expose admin-dashboard:refactor:check.",
);

console.log("Admin dashboard refactor checks passed.");
