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
  "src/lib/csv.ts must export csvSafeCell(value: string | null | undefined): string.",
);
assert(
  typeof csvModule.toCsvRow === "function",
  "src/lib/csv.ts must export toCsvRow(cells: (string | null | undefined)[]): string.",
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

// indexOf 위치 비교만으로는 `return`이 통째로 빠진 변형("error" in ctx일 때
// NextResponse.json(...)만 만들고 반환하지 않는 코드)을 못 잡는다 — 세 토큰의
// 순서 자체는 그대로라 가드가 GREEN인 채로 모든 비관리자가 전체 CSV를 받게 된다.
// 그래서 `return`이 같은 문장 안에 있음을 정규식으로 강제한다.
const guardBlockRegex =
  /if\s*\(\s*"error" in ctx\s*\)\s*\{\s*return NextResponse\.json\(\s*\{\s*error:\s*ctx\.error\s*\},\s*\{\s*status:\s*403\s*\}\s*\);?\s*\}/;
const guardBlockMatch = exportRouteSource.match(guardBlockRegex);
assert(
  guardBlockMatch,
  'export route must have `if ("error" in ctx) { return NextResponse.json({ error: ctx.error }, { status: 403 }); }` as ONE statement — a missing `return` would let non-admin requests fall through to the data query even though the auth-check/403-response/query still appear in the "correct" order.',
);

const dataQueryIndex = exportRouteSource.indexOf("getAllSignaturesForExport(");
assert(dataQueryIndex !== -1, "export route must call getAllSignaturesForExport(...).");
const guardBlockEndIndex = guardBlockMatch.index + guardBlockMatch[0].length;
assert(
  guardBlockEndIndex <= dataQueryIndex,
  "export route must call getAllSignaturesForExport(...) only after the complete 403 guard block (including its return).",
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

// ────────────────────────────────────────────────────────────────────────
// 6) 감사 기록 fail-closed — logAudit()은 대부분의 호출부에서 실패를 조용히
//    삼키지만(콘텐츠 저장 작업까지 감사 로그 하나로 막을 필요는 없다는 판단),
//    PII 대량 내보내기는 기록 자체가 목적이다. logAudit이 성공 여부를 반환하고
//    라우트가 그 값을 실제로 확인해서 실패 시 CSV를 내보내지 않는지 검사한다.
// ────────────────────────────────────────────────────────────────────────

const auditSource = read("src/lib/actions/audit.ts");
assert(
  auditSource.includes("): Promise<boolean> {"),
  "logAudit must return Promise<boolean> so callers that care (like PII export) can fail-closed on a logging failure.",
);
assert(
  !/\breturn;/.test(auditSource),
  "logAudit must not have a bare `return;` (returns undefined, i.e. an implicit failure signal by accident rather than a deliberate `return false;`) — every early exit must explicitly return true or false.",
);

const auditedCallIndex = exportRouteSource.indexOf("const audited = await logAudit(");
assert(
  auditedCallIndex !== -1,
  "export route must capture logAudit's return value (`const audited = await logAudit(...)`).",
);
const auditedGuardMatch = exportRouteSource.match(
  /if\s*\(\s*!audited\s*\)\s*\{\s*return NextResponse\.json\(\s*\{\s*error:\s*"[^"]+"\s*\},\s*\{\s*status:\s*500\s*\},?\s*\);?\s*\}/,
);
assert(
  auditedGuardMatch,
  'export route must have `if (!audited) { return NextResponse.json({ error: "..." }, { status: 500 }); }` as ONE statement — a missing `return` here would let the CSV ship even when the audit record failed to write, defeating the whole point of a PII-export audit trail.',
);
const auditedGuardIndex = exportRouteSource.indexOf(auditedGuardMatch[0]);
const finalCsvResponseIndex = exportRouteSource.indexOf("return new NextResponse(csv");
assert(
  auditedCallIndex < auditedGuardIndex && auditedGuardIndex < finalCsvResponseIndex,
  "export route must check the audit result and fail-closed BEFORE returning the CSV response.",
);

// ────────────────────────────────────────────────────────────────────────
// 7) 페이지네이션 안전판(MAX_PAGINATED_ROWS) 상한 — 지금 고치는 max_rows(1000)
//    문제와 정확히 같은 실패 부류가 10배 높은 문턱(100,000)에서 재현될 수 있다.
//    fetchAllRows가 안전판에 걸리면 truncated:true를 반환하고, CSV 내보내기는
//    이를 반드시 500으로 막아야 한다(부분 명부를 전체인 척 내보내면 안 된다).
// ────────────────────────────────────────────────────────────────────────

assert(
  /truncated: boolean;/.test(signaturesDataSource),
  "PageResult<T> must carry a `truncated: boolean` field so callers can distinguish a full result from one that hit the pagination safety cap.",
);
const whileLoopIndex = signaturesDataSource.indexOf("while (from < MAX_PAGINATED_ROWS)");
const incrementIndex = signaturesDataSource.indexOf("from += SUPABASE_PAGE_SIZE;");
const truncatedTrueIndex = signaturesDataSource.indexOf("truncated: true");
assert(
  whileLoopIndex !== -1 && incrementIndex !== -1 && truncatedTrueIndex !== -1,
  "fetchAllRows must have a MAX_PAGINATED_ROWS-guarded loop that increments `from` and, when the cap is hit, returns truncated: true.",
);
assert(
  whileLoopIndex < incrementIndex && incrementIndex < truncatedTrueIndex,
  "fetchAllRows must set truncated: true AFTER the pagination loop (i.e. only when the safety cap was reached), not inside a normal per-page branch.",
);
assert(
  signaturesDataSource.includes("truncated,") &&
    /getAllSignaturesForExport[\s\S]*?truncated: boolean\s*\}>/.test(signaturesDataSource),
  "getAllSignaturesForExport must propagate the truncated flag in its return type and value.",
);

const truncatedCheckIndex = exportRouteSource.indexOf("if (truncated)");
assert(
  truncatedCheckIndex !== -1,
  "export route must check the `truncated` flag returned by getAllSignaturesForExport.",
);
const truncatedGuardMatch = exportRouteSource.match(
  /if\s*\(\s*truncated\s*\)\s*\{[\s\S]*?return NextResponse\.json\(\s*\{\s*error:\s*"[^"]+"\s*\},\s*\{\s*status:\s*500\s*\},?\s*\);\s*\}/,
);
assert(
  truncatedGuardMatch,
  "export route must return a 500 when truncated is true — exporting a partial list as if it were the complete signature roster is worse than failing loudly.",
);
assert(
  truncatedCheckIndex < auditedCallIndex,
  "export route must check truncated BEFORE writing the audit log entry — no point auditing an export that's about to be rejected as incomplete.",
);

// ────────────────────────────────────────────────────────────────────────
// 8) dailyCounts도 같은 max_rows 함정에 노출돼 있었다 — 목표 10,000명 캠페인에서
//    14일 창에 1,000건은 잘 되는 주의 정상치다. fetchAllRows로 페이지네이션됐는지
//    확인한다.
// ────────────────────────────────────────────────────────────────────────

assert(
  /function fetchAllSignatureDailyRows/.test(signaturesDataSource),
  "signatures.ts must define fetchAllSignatureDailyRows using paginated fetchAllRows, not a bare unpaginated select for the daily-trend chart.",
);
assert(
  signaturesDataSource.includes("fetchAllSignatureDailyRows(supabase, since)"),
  "getSignatureStats must fetch the daily-trend rows through fetchAllSignatureDailyRows (paginated).",
);
assert(
  signaturesDataSource.includes("dailyResult.truncated || regionResult.truncated"),
  "getSignatureStats must treat a truncated daily-rows fetch as seriously as a truncated region-rows fetch (both feed into the same paginationTruncated warning).",
);

// ────────────────────────────────────────────────────────────────────────
// 9) csvSafeCell의 null/undefined 안전성 — created_at은 DB 스키마상 nullable
//    (DEFAULT NOW()일 뿐 NOT NULL이 아님, supabase/migrations/20260310_create_signatures.sql)
//    인데 TS 타입은 string이라 선언돼 있었다. 어떤 호출부가 `?? ""`를 빠뜨려도
//    함수 자신이 던지지 않아야 한다 — 실행 기반으로 실제 검증한다.
// ────────────────────────────────────────────────────────────────────────

assert(
  csvSafeCell(null) === '""',
  `csvSafeCell(null) must return an empty quoted cell, not throw — got ${JSON.stringify(csvSafeCell(null))}.`,
);
assert(
  csvSafeCell(undefined) === '""',
  `csvSafeCell(undefined) must return an empty quoted cell, not throw — got ${JSON.stringify(csvSafeCell(undefined))}.`,
);
assert(
  toCsvRow(["김민준", null, undefined]) === `"김민준","",""`,
  "toCsvRow must tolerate null/undefined cells (e.g. a nullable created_at) without throwing mid-export.",
);

// ────────────────────────────────────────────────────────────────────────
// 10) CSV 파일명 날짜는 KST — 이 프로젝트 전역 규칙(signatures.ts의 kstDateKey)을
//     따른다. new Date().toISOString()은 UTC라 KST 00:00~09:00 사이엔 어제
//     날짜가 찍힌다.
// ────────────────────────────────────────────────────────────────────────

assert(
  exportRouteSource.includes("kstDateKey(new Date().toISOString())"),
  "export route's CSV filename must use kstDateKey(...) from @/lib/data/signatures, not a raw UTC date.",
);
assert(
  !/toISOString\(\)\.slice\(0,\s*10\)/.test(exportRouteSource),
  "export route must not derive the filename date via new Date().toISOString().slice(0, 10) — that's UTC, and this project's date conventions are KST throughout.",
);
assert(
  /import\s*\{[^}]*kstDateKey[^}]*\}\s*from\s*"@\/lib\/data\/signatures"/.test(exportRouteSource),
  "export route must import kstDateKey from @/lib/data/signatures.",
);

// ────────────────────────────────────────────────────────────────────────
// 11) Cache-Control — 전체 서명자 명부가 담긴 응답이다. force-dynamic은 Next.js
//     라우트 캐시만 막을 뿐 응답 자체의 캐시 가능 여부는 별개이므로 명시적으로 막는다.
// ────────────────────────────────────────────────────────────────────────

assert(
  exportRouteSource.includes('"Cache-Control": "no-store, private"'),
  "export route must set Cache-Control: no-store, private — this response carries every signer's PII and must not be cached by any browser/proxy/CDN.",
);

console.log("Admin signatures export checks passed.");
