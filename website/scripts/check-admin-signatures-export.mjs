import { existsSync, readFileSync, readdirSync } from "node:fs";
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

// ────────────────────────────────────────────────────────────────────────
// 1) CSV 인젝션 방어 — 실제 함수를 실행해서 검증한다(문자열에 정규식이
//    "있는지"가 아니라, 실제 입력을 넣었을 때 나오는 출력이 안전한지).
// ────────────────────────────────────────────────────────────────────────

const csvPath = "src/lib/csv.ts";
assert(existsSync(join(root, csvPath)), `${csvPath} must exist.`);

const csvModule = await import(join(root, csvPath));
assert(
  typeof csvModule.csvSafeCell === "function",
  "src/lib/csv.ts must export csvSafeCell(value: string): string.",
);
assert(
  typeof csvModule.toCsvRow === "function",
  "src/lib/csv.ts must export toCsvRow(cells: string[]): string.",
);

const { csvSafeCell, toCsvRow } = csvModule;

// 위험한 접두문자(=, +, -, @, 탭, 캐리지리턴) — 스프레드시트가 수식으로 해석할 수
// 있는 값들. 실제 서명 필드(이름·소속·메시지)에 들어올 수 있는 공격 페이로드로 검증한다.
const dangerousInputs = [
  ["=HYPERLINK('http://evil.example','클릭')", "="],
  ["+1+1", "+"],
  ["-2+3", "-"],
  ["@SUM(1,2)", "@"],
  ["\tfoo", "\t"],
  ["\rfoo", "\r"],
];

for (const [input, label] of dangerousInputs) {
  const output = csvSafeCell(input);
  assert(
    output === `"'${input}"`,
    `csvSafeCell must prefix a leading apostrophe for values starting with "${label}" and wrap in quotes — got ${JSON.stringify(output)} for input ${JSON.stringify(input)}.`,
  );
}

// 안전한 값은 그대로(따옴표만 둘러) 나와야 한다 — 과잉 방어로 정상 이름 앞에
// 불필요한 작은따옴표가 붙으면 CSV를 열었을 때 이름이 오염되어 보인다.
const safeInputs = ["김민준", "서울특별시 강남구", "010-1234-5678", "hello@safe example"];
for (const input of safeInputs) {
  const output = csvSafeCell(input);
  assert(
    output === `"${input}"`,
    `csvSafeCell must not alter benign values — got ${JSON.stringify(output)} for input ${JSON.stringify(input)}.`,
  );
}

// 값에 이미 큰따옴표가 있으면 CSV 표준대로 "" 로 이스케이프해야 한다(안 하면
// 그 칸에서 CSV 구조가 깨져 뒤 칸들이 밀린다).
assert(
  csvSafeCell('He said "hi"') === '"He said ""hi"""',
  'csvSafeCell must double internal double-quotes per CSV escaping rules.',
);

// toCsvRow는 각 셀을 csvSafeCell로 감싸고 쉼표로 합쳐야 한다 — 위험한 셀 하나만
// 있어도 행 전체 이스케이프가 깨지지 않는지 확인한다.
assert(
  toCsvRow(["김민준", "=cmd|' /c calc'!A1"]) === `"김민준","'=cmd|' /c calc'!A1"`,
  "toCsvRow must run csvSafeCell over every cell, not just the first.",
);

// ────────────────────────────────────────────────────────────────────────
// 2) 감사 로그 action 값 — CHECK 제약을 실제로 읽어서 대조한다(하드코딩된
//    허용 목록을 가정하지 않는다 — 마이그레이션이 바뀌면 이 가드도 따라가야 한다).
// ────────────────────────────────────────────────────────────────────────

const migrationsDir = join(root, "supabase", "migrations");
const migrationSql = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(join(migrationsDir, file), "utf8"))
  .join("\n")
  .toLowerCase()
  .replace(/\s+/g, " ");

const actionCheckMatches = [
  ...migrationSql.matchAll(/action(?: text)? in \(([^)]+)\)/g),
];
assert(
  actionCheckMatches.length > 0,
  "could not find audit_log's action CHECK constraint in any migration — cannot verify allowed action values.",
);
// 여러 마이그레이션이 같은 제약을 DROP/ADD로 순차 갱신한다 — 마지막 것이 최종값이다.
const lastActionCheck = actionCheckMatches[actionCheckMatches.length - 1][1];
const allowedActions = [...lastActionCheck.matchAll(/'([^']+)'/g)].map((m) => m[1]);
assert(
  allowedActions.length > 0,
  "audit_log action CHECK constraint parsed as empty — regex likely out of sync with migration SQL.",
);

const exportRoutePath = "src/app/api/admin/signatures/export/route.ts";
assert(existsSync(join(root, exportRoutePath)), `${exportRoutePath} must exist.`);
const exportRouteSource = read(exportRoutePath);

const logAuditCallMatch = exportRouteSource.match(
  /logAudit\(\s*supabase,\s*"signatures",\s*0,\s*"([^"]+)"/,
);
assert(
  logAuditCallMatch,
  'export route must call logAudit(supabase, "signatures", 0, "<action>", ...).',
);
const usedAction = logAuditCallMatch[1];
assert(
  allowedActions.includes(usedAction),
  `export route's audit action "${usedAction}" is not in the CHECK constraint's allowed set [${allowedActions.join(", ")}] — this insert would be rejected by the DB (or, if the CHECK migration was never applied, would silently accept an action no other code expects).`,
);
assert(
  exportRouteSource.includes('entityKey: "csv_export"'),
  'export route must tag the audit entry with entityKey: "csv_export" so a generic "bulk_update" row is distinguishable from other bulk updates (e.g. page_content saves) in the audit history.',
);

// ────────────────────────────────────────────────────────────────────────
// 3) 권한 검사 — /api/admin/* 는 src/proxy.ts 매처(`/admin/:path*`) 밖이라
//    라우트 자신의 requireActiveAdmin() 호출이 유일한 방어선이다. 문자열 존재가
//    아니라 "권한 확인이 데이터 조회보다 먼저 실행되는지" 순서를 검사한다.
// ────────────────────────────────────────────────────────────────────────

const proxySource = read("src/proxy.ts");
assert(
  proxySource.includes('matcher: ["/admin/:path*"]'),
  "assumption changed: src/proxy.ts matcher no longer excludes /api/admin/* — re-check whether the export route still needs its own auth check (it still should, defense in depth, but update this comment/assertion).",
);

assert(
  exportRouteSource.includes("requireActiveAdmin"),
  "export route must import and call requireActiveAdmin().",
);
assert(
  !exportRouteSource.includes("createSupabaseServerClient"),
  "export route must not create its own Supabase client — it must use the client returned by requireActiveAdmin() so RLS applies with the caller's session, not an unauthenticated client.",
);

const ctxCheckIndex = exportRouteSource.indexOf('"error" in ctx');
const status403Index = exportRouteSource.indexOf("{ status: 403 }");
const dataQueryIndex = exportRouteSource.indexOf("getAllSignaturesForExport(");
assert(
  ctxCheckIndex !== -1 && status403Index !== -1 && dataQueryIndex !== -1,
  "export route must check `\"error\" in ctx`, return a 403, and call getAllSignaturesForExport — one of these is missing.",
);
assert(
  ctxCheckIndex < status403Index && status403Index < dataQueryIndex,
  "export route must check admin auth and return 403 BEFORE querying signatures — found the query running before (or without) the 403 guard, which would leak data to non-admins.",
);

// ────────────────────────────────────────────────────────────────────────
// 4) max_rows(1000) 상한 — Task 3에서 select("region_top") 전체 스캔이 1000건
//    이후 조용히 잘려 regionCount가 영구히 틀어졌던 것과 같은 함정이, 이번엔
//    지역 분포·중복 후보(getSignatureStats)와 CSV 내보내기(getAllSignaturesForExport)
//    양쪽에서 재발하지 않는지 확인한다. 목표 서명 수는 10,000명이라
//    페이지네이션 없는 단일 select는 최대 1000건에서 조용히 끊긴다.
// ────────────────────────────────────────────────────────────────────────

const signaturesDataPath = "src/lib/data/signatures.ts";
assert(existsSync(join(root, signaturesDataPath)), `${signaturesDataPath} must exist.`);
const signaturesDataSource = read(signaturesDataPath);

assert(
  /function fetchAllRows/.test(signaturesDataSource) &&
    signaturesDataSource.includes(".range(from, to)"),
  "signatures.ts must page through results with .range() instead of a single unpaginated select — otherwise region/duplicate aggregation silently truncates past max_rows (1000).",
);

// 지역 원본 조회(region_top, name_public 등)가 fetchAllRows 경유인지 — 별도의
// 페이지네이션 없는 select(...)로 같은 컬럼을 다시 긁어오는 회귀를 막는다.
assert(
  /fetchAllRows<SignatureRegionRow>/.test(signaturesDataSource),
  "region/duplicate/name-public-rate aggregation must go through fetchAllRows (paginated), not a bare .select().",
);
assert(
  /fetchAllRows<SignatureExportDbRow>/.test(signaturesDataSource),
  "getAllSignaturesForExport must go through fetchAllRows (paginated), not a bare .select() — CSV export must include all signatures past the 1000-row cap.",
);

// REGION_TOPS가 하드코딩된 지역 목록을 대체하는지 — 새 하드코딩 배열이 생기면
// regions.ts와 어긋날 때(권역 추가/개칭) 조용히 divergence가 생긴다.
assert(
  signaturesDataSource.includes('import { REGION_TOPS } from "@/lib/regions";'),
  "signatures.ts must import REGION_TOPS from @/lib/regions instead of hardcoding a province list.",
);
assert(
  /REGION_TOPS\.map\(\(regionTop\) => \(\{ regionTop, count: 0 \}\)\)/.test(signaturesDataSource) &&
    /REGION_TOPS\.map\(\(regionTop\) => \(\{\s*regionTop,\s*count: regionMap\.get\(regionTop\) \?\? 0,?\s*\}\)\)/.test(
      signaturesDataSource,
    ),
  "regionCounts must be seeded and built from REGION_TOPS, not a separately hardcoded array.",
);

// ────────────────────────────────────────────────────────────────────────
// 5) BOM + 화면 연동 — 엑셀 한글 깨짐 방지, 관리자 화면에 새 통계가 실제로 보이는지.
// ────────────────────────────────────────────────────────────────────────

assert(
  exportRouteSource.includes('"\\uFEFF"'),
  "export route must prepend a UTF-8 BOM (\\uFEFF) so Excel doesn't mangle Korean text.",
);

const adminPagePath = "src/app/admin/signatures/page.tsx";
assert(existsSync(join(root, adminPagePath)), `${adminPagePath} must exist.`);
const adminPageSource = read(adminPagePath);

assert(
  /href="\/api\/admin\/signatures\/export"/.test(adminPageSource),
  "/admin/signatures page must link to the export route.",
);
assert(
  adminPageSource.includes("stats.regionCounts") &&
    adminPageSource.includes("stats.namePublicRate") &&
    adminPageSource.includes("stats.duplicateCandidates"),
  "/admin/signatures page must render regionCounts, namePublicRate, and duplicateCandidates.",
);

console.log("Admin signatures export checks passed.");
