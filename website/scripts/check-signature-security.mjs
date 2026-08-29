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
  "supabase/migrations/20260828000000_solidarity_signatures.sql";
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
// 2026-08-29: 사용자가 삭제 방침을 보존으로 바꿨다 — 백업(65건, 2026-03-10~08-28)을
// 실제로 확인한 뒤의 결정이다. TRUNCATE는 다시는 이 마이그레이션에 들어오면 안
// 된다(되돌아오면 그 65건이 영구 소실된다).
assert(
  !normalizedSolidaritySql.includes("truncate"),
  "solidarity migration must NOT truncate signatures — the existing 65 rows (2026-03-10~08-28) are preserved by decision, not deleted.",
);
// TRUNCATE와 같은 결말(65건 소실)을 DELETE FROM으로 대신 저지를 수 있다 —
// 철자만 다를 뿐 같은 실패 모드라 별도 단언으로 막는다.
assert(
  !/delete\s+from\s+(public\.)?signatures\b/.test(normalizedSolidaritySql),
  "solidarity migration must NOT DELETE FROM signatures — same data-loss outcome as TRUNCATE, just spelled differently; the existing 65 rows are preserved by decision.",
);

// 기존 65건은 지역을 수집하지 않았다 — region_top을 NOT NULL로 걸기 전에
// '미상' 센티넬로 백필해야 한다. 순서도 검사한다: 백필이 SET NOT NULL보다
// 먼저 나오지 않으면 그 SET NOT NULL 자체가 기존 NULL 행 때문에 실패한다.
const legacyBackfillPattern =
  "update signatures set region_top = '미상', region_sub = '' where region_top is null";
assert(
  normalizedSolidaritySql.includes(legacyBackfillPattern),
  "solidarity migration must backfill legacy rows (region_top IS NULL) to the '미상' sentinel (region_sub '') before enforcing NOT NULL.",
);
const legacyBackfillIndex = normalizedSolidaritySql.indexOf(legacyBackfillPattern);
const regionTopSetNotNullIndex = normalizedSolidaritySql.indexOf(
  "alter column region_top set not null",
);
assert(
  regionTopSetNotNullIndex !== -1 &&
    legacyBackfillIndex < regionTopSetNotNullIndex,
  "solidarity migration must run the '미상' backfill UPDATE before ALTER COLUMN region_top SET NOT NULL, not after.",
);

assert(
  normalizedSolidaritySql.includes("add constraint signatures_region_top_check"),
  "solidarity migration must constrain region_top to the known province list.",
);

const regionsTs = readProjectFile("src/lib/regions.ts");
const regionTops = [...regionsTs.matchAll(/top:\s*"([^"]+)"/g)].map(
  (match) => match[1],
);
assert(
  regionTops.length > 0,
  "could not extract region top values from src/lib/regions.ts.",
);

const regionCheckMatch = normalizedSolidaritySql.match(
  /region_top in \((.*?)\)\)/,
);
assert(
  regionCheckMatch,
  "solidarity migration must define a region_top IN (...) CHECK list.",
);
const regionCheckLiterals = [
  ...regionCheckMatch[1].matchAll(/'([^']+)'/g),
].map((match) => match[1]);

// '미상'은 유일하게 허용되는 예외(폼이 절대 만들 수 없는 레거시 백필 전용
// 센티넬)다. 정확히 그 한 값만 예외로 두어, "개수만 맞으면 통과"하는 우회로
// 다른 값이 '미상' 자리를 대신 차지하며 몰래 들어오는 걸 막는다.
const REGION_LEGACY_SENTINEL = "미상";
const regionCheckSentinelCount = regionCheckLiterals.filter(
  (value) => value === REGION_LEGACY_SENTINEL,
).length;
assert(
  regionCheckSentinelCount === 1,
  `solidarity migration's region_top CHECK must include the legacy '${REGION_LEGACY_SENTINEL}' sentinel exactly once (found ${regionCheckSentinelCount}).`,
);
const regionCheckWithoutSentinel = regionCheckLiterals.filter(
  (value) => value !== REGION_LEGACY_SENTINEL,
);
assert(
  regionCheckWithoutSentinel.length === regionTops.length,
  `solidarity migration's region_top CHECK must list exactly the ${regionTops.length} values from src/lib/regions.ts plus the '${REGION_LEGACY_SENTINEL}' sentinel (found ${regionCheckLiterals.length} total, ${regionCheckWithoutSentinel.length} non-sentinel).`,
);
for (const top of regionTops) {
  assert(
    regionCheckWithoutSentinel.includes(top),
    `solidarity migration's region_top CHECK must include '${top}' from src/lib/regions.ts, character-for-character.`,
  );
}

assert(
  normalizedSolidaritySql.includes("add constraint signatures_affiliation_len"),
  "solidarity migration must cap affiliation length.",
);
assert(
  normalizedSolidaritySql.includes(
    "create unique index idx_signatures_unique_email on signatures (lower(btrim(email))) where email is not null and btrim(email) <> ''",
  ),
  "solidarity migration must keep a partial unique index on email, scoped to non-blank trimmed emails.",
);
assert(
  normalizedSolidaritySql.includes(
    "create index idx_signatures_wall on signatures (created_at desc, id desc) where name_public is true",
  ),
  "solidarity migration must index the public signature wall query by (created_at desc, id desc), scoped to name_public — the id tiebreaker matters because created_at is DEFAULT NOW() and a single-transaction batch insert (e.g. bulk paper-signature entry) gives every row in that batch the identical created_at.",
);
assert(
  normalizedSolidaritySql.includes("create index idx_signatures_region"),
  "solidarity migration must index region_top for aggregate queries.",
);

assert(
  normalizedSolidaritySql.includes(
    "create or replace function signature_region_count()",
  ),
  "solidarity migration must define signature_region_count() so regionCount is aggregated in the DB, not by pulling every row past Supabase's max_rows cap.",
);
assert(
  normalizedSolidaritySql.includes("security definer") &&
    normalizedSolidaritySql.includes("set search_path = public"),
  "signature_region_count() must be SECURITY DEFINER with search_path locked to public (search_path hijacking defense).",
);

// 앞의 `.includes(...)` 방식은 그 문자열이 함수 몸통이 아니라 그냥 파일 어딘가
// (예: 주석)에만 있어도, 또는 실제 WHERE 절 뒤에 `OR true`가 붙어 제외가
// 무력화돼도 통과한다. `$$ ... $$` 본문을 실제로 캡처해 그 안의 SQL과 정확히
// 일치하는지 봐야 두 우회를 모두 막는다.
const regionCountFunctionMatch = normalizedSolidaritySql.match(
  /create or replace function signature_region_count\(\).*?as \$\$(.*?)\$\$;/,
);
assert(
  regionCountFunctionMatch,
  "solidarity migration must define signature_region_count() with a $$ ... $$ SQL body immediately after its signature.",
);
const regionCountFunctionBody = regionCountFunctionMatch[1].trim();
const expectedRegionCountBody =
  "select count(distinct region_top)::int from signatures where region_top <> '미상'";
assert(
  regionCountFunctionBody === expectedRegionCountBody,
  `signature_region_count()'s $$ ... $$ body must be exactly "${expectedRegionCountBody}" (excludes the legacy '미상' sentinel) — got "${regionCountFunctionBody}". A body with an extra clause (e.g. "OR true") or an exclusion mentioned only in a comment outside the $$ ... $$ block would defeat a plain substring check.`,
);
assert(
  normalizedSolidaritySql.includes(
    "revoke all on function signature_region_count() from public, anon, authenticated",
  ),
  "signature_region_count() must revoke EXECUTE from public/anon/authenticated — a SECURITY DEFINER function left callable by anon is a privilege-escalation hole.",
);
assert(
  normalizedSolidaritySql.includes(
    "grant execute on function signature_region_count() to service_role",
  ),
  "signature_region_count() must be granted to service_role only — that's the only caller (the server-side signatures API).",
);

const wallModulePath = "src/lib/signatures/api/wall.ts";
assert(existsSync(join(root, wallModulePath)), `${wallModulePath} must exist.`);

const wallModule = readProjectFile(wallModulePath);
for (const forbiddenField of [
  "email",
  "message",
  "affiliation",
  "ip_hash",
  "consent_",
]) {
  assert(
    !wallModule.includes(forbiddenField),
    `signature wall module must not select ${forbiddenField}.`,
  );
}
// 위 반리스트 검사는 select()가 그 리터럴을 문자 그대로 담고 있을 때만 유효하다.
// select("*") — 또는 select() 인자를 아예 비워도 PostgREST 기본값은 * 다 — 는
// 금지어를 하나도 포함하지 않으면서 email·message·affiliation·ip_hash·consent_*를
// 전부 서버 프로세스로 끌어온다. 그래서 (a) 정확한 컬럼 목록을 명시적으로
// select하는지 양성 단언하고, (b) 와일드카드 select와 (c) 행 전체를 스프레드하는
// 매핑을 별도로 금지한다.
assert(
  wallModule.includes(
    '.select("id, name, region_top, region_sub, created_at")',
  ),
  "signature wall module must select an explicit, exact column list — not a wildcard.",
);
assert(
  !/\.select\([^)]*\*/.test(wallModule),
  "signature wall module must not select * — that pulls email/message/ip_hash/consent_* into the process even if the response mapping later narrows it.",
);
assert(
  !/\.\.\.row/.test(wallModule),
  "signature wall module must map response fields explicitly, never spread the DB row — a spread silently re-exposes any column added to the select later.",
);
assert(
  wallModule.includes('.eq("name_public", true)'),
  "signature wall module must filter to name_public rows only.",
);

const wallRoutePath = "src/app/api/signatures/wall/route.ts";
assert(existsSync(join(root, wallRoutePath)), `${wallRoutePath} must exist.`);

const wallRoute = readProjectFile(wallRoutePath);
for (const forbiddenField of [
  "email",
  "message",
  "affiliation",
  "ip_hash",
  "consent_",
]) {
  assert(
    !wallRoute.includes(forbiddenField),
    `signature wall route must not expose ${forbiddenField}.`,
  );
}
assert(
  !/["']@\/lib\/supabase["']/.test(wallRoute),
  "signature wall route must not use the public anon Supabase client — this also catches dynamic import(\"@/lib/supabase\"), not just static `from` imports.",
);
assert(
  /if\s*\(\s*IS_PRODUCTION\s*\)\s*return\s+missingSignatureServiceResponse\(\)/.test(
    wallRoute,
  ),
  "signature wall route must fail closed in production when Supabase is unconfigured, not silently serve demo data — checking that both identifiers merely appear in the file (e.g. as unused imports) is not enough, the call must actually be gated by IS_PRODUCTION.",
);
assert(
  wallRoute.includes("createSupabaseServiceClient"),
  "signature wall route must use the server-only service-role client.",
);

console.log("Signature security checks passed.");
