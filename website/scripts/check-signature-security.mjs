import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const migrationsDir = join(root, "supabase", "migrations");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readProjectFile(path) {
  return readFileSync(join(root, path), "utf8");
}

function lastIndexOfSqlPattern(sql, pattern) {
  const normalized = sql.toLowerCase().replace(/\s+/g, " ");
  let lastIndex = -1;
  for (const match of normalized.matchAll(pattern)) {
    lastIndex = match.index ?? -1;
  }
  return lastIndex;
}

const migrationSql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
  .join("\n");

const normalizedSql = migrationSql.toLowerCase().replace(/\s+/g, " ");
const lastAnonSelectPolicy = lastIndexOfSqlPattern(
  migrationSql,
  /create policy "allow anonymous select" on (?:public\.)?signatures/g,
);
const lastAnonInsertPolicy = lastIndexOfSqlPattern(
  migrationSql,
  /create policy "allow anonymous inserts" on (?:public\.)?signatures/g,
);
const lastDropAnonSelect = lastIndexOfSqlPattern(
  migrationSql,
  /drop policy if exists "allow anonymous select" on (?:public\.)?signatures/g,
);
const lastDropAnonInsert = lastIndexOfSqlPattern(
  migrationSql,
  /drop policy if exists "allow anonymous inserts" on (?:public\.)?signatures/g,
);
const lastAuthenticatedReadPolicy = lastIndexOfSqlPattern(
  migrationSql,
  /create policy "authenticated read signatures" on (?:public\.)?signatures/g,
);
const lastDropAuthenticatedRead = lastIndexOfSqlPattern(
  migrationSql,
  /drop policy if exists "authenticated read signatures" on (?:public\.)?signatures/g,
);

assert(
  lastDropAnonSelect > lastAnonSelectPolicy,
  "signatures must drop the anon SELECT policy after it was created.",
);
assert(
  lastDropAnonInsert > lastAnonInsertPolicy,
  "signatures must drop the anon INSERT policy after it was created.",
);
assert(
  /revoke select,\s*insert,\s*update,\s*delete on (?:table )?(?:public\.)?signatures from anon/.test(
    normalizedSql,
  ),
  "signatures must revoke direct anon table access.",
);
assert(
  /grant select on (?:table )?(?:public\.)?signatures to authenticated/.test(
    normalizedSql,
  ),
  "authenticated admins must be able to read signatures.",
);
assert(
  lastDropAuthenticatedRead > lastAuthenticatedReadPolicy,
  "signatures must drop the broad authenticated read policy after it was created.",
);
assert(
  /create policy "signatures_admin_read" on (?:public\.)?signatures for select to authenticated using \(is_active_admin\(\)\)/.test(
    normalizedSql,
  ),
  "signatures SELECT must be limited to active admins.",
);
assert(
  /grant select,\s*insert on (?:table )?(?:public\.)?signatures to service_role/.test(
    normalizedSql,
  ),
  "server routes must have explicit service_role access to signatures.",
);

const signatureRoute = readProjectFile("src/app/api/signatures/route.ts");
assert(
  !/from\s+["']@\/lib\/supabase["']/.test(signatureRoute),
  "signature API must not use the public anon Supabase client.",
);
assert(
  signatureRoute.includes("createSupabaseServiceClient"),
  "signature API must use the server-only service-role client.",
);
assert(
  !signatureRoute.includes("{ status: 200 }"),
  "signature API must not report missing Supabase relations as a successful response.",
);

const keepAliveRoute = readProjectFile("src/app/api/keep-alive/route.ts");
assert(
  keepAliveRoute.includes("createSupabaseServiceClient"),
  "keep-alive API must use the server-only service-role client.",
);

const envExample = readProjectFile(".env.example");
assert(
  envExample.includes("SUPABASE_SERVICE_ROLE_KEY="),
  ".env.example must document SUPABASE_SERVICE_ROLE_KEY.",
);

console.log("Signature security checks passed.");
