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

// ---------------------------------------------------------------------------
// region_top/region_sub의 DEFAULT — 배포 창(deployment window) 안전망.
//
// 마이그레이션은 코드보다 먼저 적용된다(supabase db push → Vercel 빌드·배포).
// 그 사이 구 코드가 여전히 살아서 {name, email, message, ip_hash,
// consent_privacy, consent_age} 여섯 컬럼만 INSERT한다(git show
// f2d0ead:website/src/lib/signatures/api/store.ts). region_top/region_sub에
// DEFAULT 없이 NOT NULL만 걸리면 그 INSERT가 전부 23502 not_null_violation으로
// 죽어 시민에게 "서명 제출에 실패했습니다."가 뜬다. 새 코드에 문제가 생겨
// 이전 배포로 롤백하면 그 순간 다시 같은 상태가 되므로, 이 DEFAULT는 배포가
// 끝나면 없어도 되는 임시물이 아니라 롤백 안전망이다.
//
// "NOT NULL인데 DEFAULT가 왜 있지"라며 지우는 일이 없도록 여기서 고정한다.
// 주석에만 적힌 SET DEFAULT가 통과하지 않도록 주석을 제거한 SQL로 검사한다.
const solidaritySqlWithoutComments = solidarityMigration
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))
  .join("\n")
  .toLowerCase()
  .replace(/\s+/g, " ");

// SET DEFAULT는 테이블 범위로 검사한다 — 리뷰에서 지적된 구멍: 이전 버전은
// "alter column region_top set default '미상'" 문자열이 파일 어딘가에만 있으면
// 통과했다. 그 문자열이 다른 테이블을 대상으로 한 ALTER TABLE 문 안에 있어도
// (디코이) 통과해, signatures 테이블 자체의 DEFAULT가 실제로는 빠진 걸 놓칠 수
// 있다. `ALTER TABLE (public.)?signatures ...;` 문장 몸통 안에서만 찾는다.
const alterSignaturesStatements = [
  ...solidaritySqlWithoutComments.matchAll(
    /alter table (?:public\.)?signatures\s+([^;]*);/g,
  ),
].map((match) => match[1]);

for (const [column, defaultLiteral] of [
  ["region_top", "'미상'"],
  ["region_sub", "''"],
]) {
  const hasTableScopedDefault = alterSignaturesStatements.some((body) =>
    body.includes(`alter column ${column} set default ${defaultLiteral}`),
  );
  assert(
    hasTableScopedDefault,
    `solidarity migration must give signatures.${column} a DEFAULT (${defaultLiteral}) INSIDE an "ALTER TABLE signatures" statement specifically — the schema lands before the new code deploys, and the still-live old code INSERTs without ${column}. Without the DEFAULT every signature submitted during that window (and after any rollback to the previous deploy) fails with 23502 not_null_violation. A SET DEFAULT clause written under a different table name would satisfy a plain substring search while leaving signatures.${column} without its rollback-window DEFAULT.`,
  );
}

// DROP DEFAULT는 이 파일 안에 있으면 안 된다. 이 파일 자신의 주석(바로 위)이
// "신규 코드 배포 확인 후 별도 마이그레이션으로 DROP DEFAULT 한다"고 명시한다 —
// 그 롤백 창 안전망을 언제 걷어낼지는 컨트롤러가 나중에 별도 마이그레이션에서
// 판단할 몫이지, 이미 프로덕션에 적용된 이 파일이 조용히 되돌릴 자리가 아니다.
// 이 금지는 이 파일 하나로 범위를 좁힌다 — 나중에 롤백 창이 닫힌 뒤 컨트롤러가
// 승인한 새 마이그레이션 파일(예: 20260829000000_signature_admin_stats.sql)이
// DROP DEFAULT를 쓰는 건 이 가드가 막지 않는다. 테이블명은 특정하지 않고
// region_top/region_sub 컬럼의 DROP DEFAULT를 통째로 금지한다 — 이 파일에는 그
// 두 컬럼의 DEFAULT를 없앨 이유가 애초에 없다(어느 테이블이든).
for (const column of ["region_top", "region_sub"]) {
  assert(
    !solidaritySqlWithoutComments.includes(`alter column ${column} drop default`),
    `${solidarityMigrationPath} must NOT DROP DEFAULT on ${column} — this migration already shipped to production. Dropping the DEFAULT here would silently remove the rollback-window safety net that this same file's own comment says is deferred to a separate, later migration once the deploy is confirmed safe.`,
  );
}

const regionTopSetDefaultIndex = solidaritySqlWithoutComments.indexOf(
  "alter column region_top set default",
);
const regionTopSetNotNullIndexNoComments = solidaritySqlWithoutComments.indexOf(
  "alter column region_top set not null",
);
const regionTopCheckIndexNoComments = solidaritySqlWithoutComments.indexOf(
  "add constraint signatures_region_top_check",
);
assert(
  regionTopSetNotNullIndexNoComments !== -1 &&
    regionTopSetDefaultIndex > regionTopSetNotNullIndexNoComments,
  "the region DEFAULTs must come after ALTER COLUMN region_top SET NOT NULL — placing them earlier would let a later edit reorder the backfill/NOT NULL pair around them.",
);
assert(
  regionTopCheckIndexNoComments !== -1 &&
    regionTopSetDefaultIndex < regionTopCheckIndexNoComments,
  "the region DEFAULTs must come before ADD CONSTRAINT signatures_region_top_check, so the '미상' default is written while the CHECK that must accept it is still being defined right below.",
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

// ---------------------------------------------------------------------------
// signature_admin_stats() — 관리자 통계 집계 RPC(2026-08-29 팔로업,
// supabase/migrations/20260829000000_signature_admin_stats.sql). 지역 분포·공개
// 동의율·중복 후보·일별 추이 전체를 이 함수 하나가 계산하므로, 여기서 권한이
// 느슨해지면 signatures 테이블 전체를 우회 조회하는 것과 같은 반경의 구멍이
// 생긴다. signature_region_count()와 정확히 같은 패턴을 요구한다: SECURITY
// DEFINER, search_path 고정, service_role에만 EXECUTE.
// ---------------------------------------------------------------------------

const adminStatsMigrationPath =
  "supabase/migrations/20260829000000_signature_admin_stats.sql";
assert(
  existsSync(join(root, adminStatsMigrationPath)),
  `${adminStatsMigrationPath} must exist.`,
);
const adminStatsMigration = readProjectFile(adminStatsMigrationPath);
const adminStatsSqlNoComments = adminStatsMigration
  .split("\n")
  .map((line) => line.replace(/--.*$/, ""))
  .join("\n")
  .toLowerCase()
  .replace(/\s+/g, " ");

assert(
  adminStatsSqlNoComments.includes(
    "create or replace function signature_admin_stats(p_since timestamptz)",
  ),
  "signature_admin_stats() must be defined with a single p_since timestamptz parameter.",
);
assert(
  adminStatsSqlNoComments.includes("security definer") &&
    adminStatsSqlNoComments.includes("set search_path = public"),
  "signature_admin_stats() must be SECURITY DEFINER with search_path locked to public (search_path hijacking defense) — it reads the full signatures table, same trust level as signature_region_count().",
);

const adminStatsFunctionMatch = adminStatsSqlNoComments.match(
  /create or replace function signature_admin_stats\(p_since timestamptz\).*?as \$\$(.*?)\$\$;/,
);
assert(
  adminStatsFunctionMatch,
  "signature_admin_stats() must have a $$ ... $$ SQL body immediately after its signature.",
);
const adminStatsFunctionBody = adminStatsFunctionMatch[1].trim();
const expectedAdminStatsBody =
  "select jsonb_build_object( 'regioncounts', ( select coalesce( jsonb_agg(jsonb_build_object('regiontop', region_top, 'count', region_cnt)), '[]'::jsonb ) from ( select region_top, count(*) as region_cnt from signatures where region_top <> '미상' group by region_top ) region_agg ), 'unknownregioncount', ( select count(*) from signatures where region_top = '미상' ), 'namepublicratebase', ( select count(*) from signatures where region_top <> '미상' ), 'namepublictruecount', ( select count(*) filter (where name_public) from signatures ), 'duplicatecandidates', ( select coalesce( jsonb_agg( jsonb_build_object( 'name', name, 'regiontop', region_top, 'regionsub', region_sub, 'count', dup_cnt ) order by dup_cnt desc, name ), '[]'::jsonb ) from ( select name, region_top, region_sub, count(*) as dup_cnt from signatures where region_top <> '미상' group by name, region_top, region_sub having count(*) > 1 ) dup_agg ), 'dailycounts', ( select coalesce( jsonb_agg(jsonb_build_object('date', day, 'count', day_cnt) order by day), '[]'::jsonb ) from ( select ((created_at at time zone 'asia/seoul')::date)::text as day, count(*) as day_cnt from signatures where created_at >= p_since group by day ) daily_agg ) );";
assert(
  adminStatsFunctionBody === expectedAdminStatsBody,
  `signature_admin_stats()'s $$ ... $$ body must match exactly — got "${adminStatsFunctionBody}". A body missing the region_top <> '미상' exclusion (region/duplicate/rate stats) or the created_at >= p_since / Asia/Seoul day bucketing would silently reproduce the exact JS bugs this RPC exists to prevent (legacy-row dilution, UTC-day chart drift).`,
);
assert(
  adminStatsSqlNoComments.includes(
    "revoke all on function signature_admin_stats(timestamptz) from public, anon, authenticated",
  ),
  "signature_admin_stats() must revoke EXECUTE from public/anon/authenticated — it is a SECURITY DEFINER function reading the full signatures table, so leaving it callable by anon/authenticated is a privilege-escalation hole exactly like signature_region_count() guards against.",
);
// 순수 .includes()는 GRANT를 "느슨하게" 만드는 공격(예: service_role 뒤에
// ", authenticated"를 덧붙임)을 놓친다 — "...to service_role"이 "...to
// service_role, authenticated"의 부분 문자열이라 그대로 통과해버린다(이 파일이
// 흉내 낸 signature_region_count() 쪽 검사에도 같은 결함이 있다 — 리포트에
// 기록). 문장이 정확히 "to service_role;"로 끝나는지(뒤에 다른 역할이
// 이어붙지 않는지) 정규식으로 못박는다.
assert(
  /grant execute on function signature_admin_stats\(timestamptz\) to service_role;/.test(
    adminStatsSqlNoComments,
  ),
  "signature_admin_stats() must be granted to service_role ONLY (the GRANT statement must end right after service_role, not widen to `, authenticated` or any other role) — src/lib/data/signatures.ts calls it via createSupabaseServiceClient(), not the cookie-scoped anon/authenticated client.",
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
