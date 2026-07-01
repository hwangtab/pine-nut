import { readFileSync } from "node:fs";
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

const proxySource = read("src/proxy.ts");
const actionAuthSource = read("src/lib/actions/auth.ts");
const adminMembersSource = read("src/lib/data/admin-members.ts");
const migrationSql = read("supabase/migrations/20260701000001_admin_role_security_hardening.sql")
  .toLowerCase()
  .replace(/\s+/g, " ");

assert(
  proxySource.includes('supabase.rpc("is_active_admin")'),
  "admin proxy must verify active admin membership, not only login state.",
);
assert(
  proxySource.includes("adminCheckError ? false"),
  "admin proxy must fail closed when active-admin RPC cannot be checked.",
);
assert(
  proxySource.includes("isAdminPublicPage") &&
    proxySource.includes("canAccessAdmin") &&
    proxySource.includes(": response"),
  "admin login/signup must stay reachable for non-admin or unclaimed users.",
);
assert(
  proxySource.includes('NextResponse.redirect(new URL("/admin/login", request.url))'),
  "non-active users must be redirected away from protected admin pages.",
);
assert(
  migrationSql.includes("idx_admin_members_email_normalized_unique") &&
    migrationSql.includes("lower(btrim(email))"),
  "admin member emails must have a normalized unique index.",
);
assert(
  migrationSql.includes("admin_members_email_lowercase") &&
    migrationSql.includes("email = lower(btrim(email))"),
  "admin member emails must be stored in canonical lowercase form.",
);
assert(
  migrationSql.includes('drop policy if exists "audit_admin_insert"') &&
    migrationSql.includes('create policy "audit_editor_insert"') &&
    migrationSql.includes("with check (admin_can_edit())"),
  "audit log inserts must be limited to editor+ admins, not read-only viewers.",
);
assert(
  actionAuthSource.includes("pickHighestAdminMember") &&
    actionAuthSource.includes("ROLE_RANK") &&
    !actionAuthSource.includes('.order("role"'),
  "admin action auth must choose roles by product rank, not lexicographic SQL ordering.",
);
assert(
  adminMembersSource.includes('supabase.rpc("admin_role")') &&
    !adminMembersSource.includes('.order("role"'),
  "admin UI role checks must use the same ranked DB role resolution as RLS.",
);

console.log("Admin auth gate checks passed.");
