import { existsSync, readFileSync, readdirSync } from "node:fs";
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

const solidarityMigrationPath =
  "supabase/migrations/20260828_solidarity_signatures.sql";
assert(
  existsSync(join(root, solidarityMigrationPath)),
  `${solidarityMigrationPath} must exist.`,
);

const solidarityMigration = readProjectFile(solidarityMigrationPath);
const normalizedSolidaritySql = solidarityMigration
  .toLowerCase()
  .replace(/\s+/g, " ");

for (const requiredColumn of [
  "add column region_top",
  "add column region_sub",
  "add column affiliation",
  "add column name_public",
]) {
  assert(
    normalizedSolidaritySql.includes(requiredColumn),
    `solidarity migration must ${requiredColumn}.`,
  );
}

assert(
  normalizedSolidaritySql.includes("alter column email drop not null"),
  "solidarity migration must make email optional.",
);
assert(
  normalizedSolidaritySql.includes("truncate signatures restart identity"),
  "solidarity migration must truncate existing signature data after backup.",
);
assert(
  /add constraint signatures_region_top_check check \(region_top in \(/.test(
    normalizedSolidaritySql,
  ),
  "solidarity migration must constrain region_top to the known province list.",
);
assert(
  normalizedSolidaritySql.includes("'해외'"),
  "solidarity migration's region_top CHECK must include '해외'.",
);
assert(
  normalizedSolidaritySql.includes("add constraint signatures_affiliation_len"),
  "solidarity migration must cap affiliation length.",
);
assert(
  normalizedSolidaritySql.includes("create unique index idx_signatures_unique_email"),
  "solidarity migration must keep a partial unique index on email.",
);
assert(
  normalizedSolidaritySql.includes("create index idx_signatures_wall"),
  "solidarity migration must index the public signature wall query.",
);
assert(
  normalizedSolidaritySql.includes("create index idx_signatures_region"),
  "solidarity migration must index region_top for aggregate queries.",
);

console.log("Signature security checks passed.");
