import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { REGION_TOPS } from "@/lib/regions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createSupabaseServiceClient } from "@/lib/supabase-service";
import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";

// '미상'은 supabase/migrations/20260828000000_solidarity_signatures.sql가 정의한
// 레거시 백필 센티넬이다. 폼(src/lib/regions.ts의 isValidRegionPair)은 이 값을
// 절대 만들지 못한다 — 2026-08-28 이전 서명 65건에만 DB 마이그레이션이 직접
// 채워 넣은 값이다. 이 파일에서는 더 이상 이 값을 직접 다루지 않는다 —
// 지역·중복·공개동의율 집계는 signature_admin_stats() RPC(20260829000000
// 마이그레이션)로 넘어갔고, 그 SQL이 '미상' 필터링을 담당한다.
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** 기준 시각에서 daysAgo일 전의 "KST 자정"에 해당하는 UTC 시각. */
function kstDayStart(base: Date, daysAgo = 0): Date {
  const kst = new Date(base.getTime() + KST_OFFSET_MS);
  const midnightKst = Date.UTC(
    kst.getUTCFullYear(),
    kst.getUTCMonth(),
    kst.getUTCDate() - daysAgo,
  );
  return new Date(midnightKst - KST_OFFSET_MS);
}

/** UTC 시각을 KST 기준 YYYY-MM-DD로 바꾼다. 이 파일 밖(CSV 내보내기 파일명 등)에서도
 * "이 프로젝트는 KST 기준"이라는 규칙을 그대로 따르도록 export한다 — 별도로
 * `new Date().toISOString()`을 쓰면 KST 00:00~09:00 사이에 하루 어긋난 날짜가 찍힌다. */
export function kstDateKey(iso: string): string {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS)
    .toISOString()
    .split("T")[0];
}

// Supabase PostgREST의 기본 max_rows(1000, supabase/config.toml)를 넘는 테이블은
// select()가 앞쪽 1000행만 "에러 없이" 조용히 반환한다. 이전에 signature_region_count()
// RPC 없이 select("region_top")로 전체를 끌어오려다 정확히 이 함정에 걸려 regionCount가
// 1000건을 넘는 순간부터 영구히 틀린 값이 됐던 사례가 있다(supabase/migrations/
// 20260828000000_solidarity_signatures.sql 참고). 지역 분포·공개 동의율·중복 후보·
// 최근 N일 추이는 signature_admin_stats() RPC(20260829000000 마이그레이션)가 SQL
// 집계로 계산하므로 이 함정에서 벗어났다 — 아래 fetchAllRows는 이제 CSV 내보내기
// (전체 명부가 진짜 목적인 유일한 경로)에만 남아 있다. 목표 서명 수(10,000명)를
// 감안해 range()로 페이지를 나눠 전량을 끌어온다.
const SUPABASE_PAGE_SIZE = 1000;
// 안전판: 목표 10,000명의 10배를 넉넉히 잡는다. 이 상한에 실제로 닿으면 "일부만
// 가져온 결과를 전체인 척" 보고하지 않고 truncated:true로 알린다(아래 fetchAllRows).
const MAX_PAGINATED_ROWS = 100_000;

interface PageResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
  /** true면 안전판(MAX_PAGINATED_ROWS)에 걸려 루프를 중단했다는 뜻 — data가 전체가
   * 아닐 수 있다. 호출부는 이 경우를 error와 똑같이(또는 더 엄격하게) 다뤄야 한다. */
  truncated: boolean;
}

/**
 * fetchPage(from, to)를 max_rows 페이지 크기로 반복 호출해 전체 행을 모은다.
 * 마지막 페이지가 페이지 크기보다 작게 오면(또는 비면) 종료한다.
 */
async function fetchAllRows<T>(
  fetchPage: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: PostgrestError | null }>,
): Promise<PageResult<T>> {
  const rows: T[] = [];
  let from = 0;
  while (from < MAX_PAGINATED_ROWS) {
    const { data, error } = await fetchPage(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) return { data: rows, error, truncated: false };
    if (!data || data.length === 0) return { data: rows, error: null, truncated: false };
    rows.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) return { data: rows, error: null, truncated: false };
    from += SUPABASE_PAGE_SIZE;
  }
  // 루프가 안전판에 걸려 끝났다 — 마지막으로 읽은 페이지까지 계속 꽉 차 있었으므로
  // 그 뒤에 더 남아있을 가능성이 있다. 일부만 모아놓고 "전체"라고 반환하면 CSV
  // 내보내기가 명부 일부를 완전한 명부인 척 내보내게 된다.
  console.error(
    `fetchAllRows: pagination safety cap reached (${MAX_PAGINATED_ROWS} rows) — refusing to report a partial result as complete.`,
  );
  return { data: rows, error: null, truncated: true };
}

export interface SignatureExportRow {
  id: number;
  name: string;
  namePublic: boolean;
  regionTop: string;
  regionSub: string;
  affiliation: string | null;
  email: string | null;
  message: string | null;
  createdAt: string | null;
}

interface SignatureExportDbRow {
  id: number;
  name: string;
  name_public: boolean;
  region_top: string;
  region_sub: string;
  affiliation: string | null;
  email: string | null;
  message: string | null;
  // DB 컬럼은 DEFAULT NOW()일 뿐 NOT NULL이 아니다(supabase/migrations/
  // 20260310_create_signatures.sql) — TS 타입도 그 사실을 정직하게 반영한다.
  created_at: string | null;
}

/** CSV 내보내기용 전량 조회. 같은 max_rows 함정을 피하려고 fetchAllRows로 페이지네이션한다.
 * truncated:true면 안전판에 걸려 일부만 모은 것 — 호출부(CSV 라우트)는 이를 반드시
 * 에러로 취급해 "부분 명부"를 "전체 명부"인 척 내보내지 않아야 한다. */
export async function getAllSignaturesForExport(
  supabase: SupabaseClient,
): Promise<{ rows: SignatureExportRow[]; error: PostgrestError | null; truncated: boolean }> {
  const { data, error, truncated } = await fetchAllRows<SignatureExportDbRow>((from, to) =>
    supabase
      .from("signatures")
      .select(
        "id, name, name_public, region_top, region_sub, affiliation, email, message, created_at",
      )
      .order("id", { ascending: true })
      .range(from, to),
  );

  return {
    rows: (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      namePublic: r.name_public,
      regionTop: r.region_top,
      regionSub: r.region_sub,
      affiliation: r.affiliation,
      email: r.email,
      message: r.message,
      createdAt: r.created_at,
    })),
    error,
    truncated,
  };
}

export interface SignatureRegionCount {
  regionTop: string;
  count: number;
}

export interface SignatureDuplicateCandidate {
  name: string;
  regionTop: string;
  regionSub: string;
  count: number;
}

export interface SignatureStats {
  totalCount: number;
  /** email은 이 브랜치에서 nullable이 됐고(연대서명 전환: 이메일 선택 필드),
   *  created_at도 스키마상 NOT NULL이 아니다. SignatureExportRow는 이미 둘 다
   *  `| null`로 정직하게 선언돼 있다 — 여기만 거짓말을 하면 화면이 null을
   *  new Date()에 넣어 "1970. 1. 1."을 띄운다. */
  recentSignatures: {
    name: string;
    email: string | null;
    message: string | null;
    createdAt: string | null;
  }[];
  dailyCounts: { date: string; count: number }[];
  regionCounts: SignatureRegionCount[];
  /** '미상'(supabase/migrations/20260828000000_solidarity_signatures.sql) 서명 건수 —
   * 2026-08-28 이전 65건은 지역을 수집하지 않아 이 센티넬로 백필됐다. regionCounts는
   * REGION_TOPS(17개 시·도 + 해외)로만 시드·구성되므로(admin-signatures-export 가드가
   * 이 형태를 고정한다) 그 배열엔 '미상'이 낄 자리가 없다 — 별도 필드로 빼지 않으면
   * 이 65건이 지역 분포 화면에서 조용히 사라진다. */
  unknownRegionCount: number;
  /** namePublicRate의 분모(레거시 '미상' 서명 제외). 레거시 65건은
   * name_public이 DEFAULT false로 강제 백필된 것이지 동의 여부를 물은 적이
   * 없다 — 분모에 넣으면 신규 서명자가 전원 동의해도 동의율이 과거분에
   * 희석되어 낮게 보인다. 화면에 "N건 기준" 캡션을 달 때 이 값을 쓴다. */
  namePublicRateBase: number;
  namePublicRate: number;
  duplicateCandidates: SignatureDuplicateCandidate[];
  usingFallback: boolean;
  warning: string | null;
}

/** supabase/migrations/20260829000000_signature_admin_stats.sql이 정의한
 * signature_admin_stats() RPC의 반환 형태. 지역 분포·공개 동의율·중복 후보·
 * 일별 버킷을 전부 SQL 집계로 계산해 한 번의 호출로 돌려받는다 — 예전에는 이
 * 원본 행을 전부 range() 페이지네이션해 Node로 끌어온 뒤 이 파일에서 계산했다
 * (10,000건이면 페이지 로드 한 번에 11~15회 왕복). */
interface SignatureAdminStatsRpcResult {
  regionCounts: { regionTop: string; count: number }[];
  unknownRegionCount: number;
  namePublicRateBase: number;
  namePublicTrueCount: number;
  duplicateCandidates: SignatureDuplicateCandidate[];
  dailyCounts: { date: string; count: number }[];
}

function isRegionCountEntry(value: unknown): value is { regionTop: string; count: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.regionTop === "string" && typeof v.count === "number";
}

function isDuplicateCandidateEntry(value: unknown): value is SignatureDuplicateCandidate {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.regionTop === "string" &&
    typeof v.regionSub === "string" &&
    typeof v.count === "number"
  );
}

function isDailyCountEntry(value: unknown): value is { date: string; count: number } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.date === "string" && typeof v.count === "number";
}

/** RPC 응답은 PostgREST를 거친 unknown JSON이라 TS 타입이 실제 모양을 보장하지
 * 않는다 — 함수 시그니처가 바뀌었는데 이 파일을 안 고치면 필드 하나가 조용히
 * undefined가 되어 화면 렌더링 중간에서 죽는다. 배열 원소 형태까지 검사한다 —
 * `Array.isArray`만 확인하면 SQL 쪽 키 오타(예: regionTop → regiontop)가
 * 조용히 "전 지역 0건"으로 렌더링될 뿐 아무 에러도 안 낸다. (SQL 가드의
 * $$ ... $$ 본문 일치 검사는 비교 전에 전체를 소문자화해서 이런 대소문자
 * 오타를 못 잡는다 — 여기가 그 구멍을 막는 두 번째 방어선이다.) 형태가
 * 어긋나면 error 경로로 합류시켜 fail-closed시킨다. */
function isSignatureAdminStatsRpcResult(
  value: unknown,
): value is SignatureAdminStatsRpcResult {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    Array.isArray(v.regionCounts) &&
    v.regionCounts.every(isRegionCountEntry) &&
    typeof v.unknownRegionCount === "number" &&
    typeof v.namePublicRateBase === "number" &&
    typeof v.namePublicTrueCount === "number" &&
    Array.isArray(v.duplicateCandidates) &&
    v.duplicateCandidates.every(isDuplicateCandidateEntry) &&
    Array.isArray(v.dailyCounts) &&
    v.dailyCounts.every(isDailyCountEntry)
  );
}

/** signature_admin_stats() 호출. signature_region_count()와 같은 신뢰 경계 —
 * EXECUTE는 service_role에만 부여돼 있으므로(20260829000000 마이그레이션) 반드시
 * 서비스 롤 클라이언트로 불러야 한다. 호출부(/admin/signatures 페이지)는
 * src/proxy.ts matcher(/admin/:path*)로 이미 활성 관리자만 도달한다 — CSV
 * 내보내기 라우트가 requireActiveAdmin() 뒤에서 서비스 클라이언트를 쓰는 것과
 * 같은 경계다. */
async function fetchSignatureAdminStats(
  serviceClient: SupabaseClient,
  since: Date,
): Promise<{
  data: SignatureAdminStatsRpcResult | null;
  error: PostgrestError | Error | null;
}> {
  const { data, error } = await serviceClient.rpc("signature_admin_stats", {
    p_since: since.toISOString(),
  });
  if (error) return { data: null, error };
  if (!isSignatureAdminStatsRpcResult(data)) {
    return {
      data: null,
      error: new Error(
        `signature_admin_stats() returned an unexpected shape: ${JSON.stringify(data)}`,
      ),
    };
  }
  return { data, error: null };
}

export async function getSignatureStats(days = 14): Promise<SignatureStats> {
  const supabase = await createSupabaseServerClient();
  const periodDays = Math.max(1, days);

  const fallback: SignatureStats = {
    totalCount: 0,
    recentSignatures: [],
    dailyCounts: [],
    regionCounts: REGION_TOPS.map((regionTop) => ({ regionTop, count: 0 })),
    unknownRegionCount: 0,
    namePublicRateBase: 0,
    namePublicRate: 0,
    duplicateCandidates: [],
    usingFallback: true,
    warning: formatSupabaseRelationWarning("signatures", "서명"),
  };

  if (!supabase) return fallback;

  // signature_admin_stats()는 service_role 전용 RPC다(20260829000000
  // 마이그레이션) — SUPABASE_SERVICE_ROLE_KEY가 없는 환경(키 회전 창, 설정
  // 실수 등)에서는 createSupabaseServiceClient()가 null을 돌려준다. 이 경우
  // RPC 호출 자체를 건너뛰고, 아래에서 그 사실을 "RPC 유래 통계만 부분
  // fallback" 경로로 자연스럽게 합류시킨다 — 총 서명 수·최근 서명 목록까지
  // 갈아엎지 않는다(바로 아래 countRecentError 처리 참고).
  const serviceClient = createSupabaseServiceClient();

  // 서명자도 운영진도 한국에 있다. UTC 기준으로 날짜를 자르면 KST 00:00~09:00의
  // 서명이 전날 막대에 들어가고, 오전에는 '오늘' 막대가 통째로 비어 보인다.
  const since = kstDayStart(new Date(), periodDays - 1);
  const [countResult, recentResult, statsResult] = await Promise.all([
    supabase.from("signatures").select("*", { count: "exact", head: true }),
    supabase
      .from("signatures")
      .select("name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    serviceClient
      ? fetchSignatureAdminStats(serviceClient, since)
      : Promise.resolve<{
          data: SignatureAdminStatsRpcResult | null;
          error: PostgrestError | Error | null;
        }>({
          data: null,
          error: new Error(
            "SUPABASE_SERVICE_ROLE_KEY missing — cannot call signature_admin_stats().",
          ),
        }),
  ]);

  // count·recentSignatures는 쿠키 세션 클라이언트(RLS 정책 signatures_admin_read)로
  // 얻는 값이라 serviceClient 상태와 무관하게 신뢰할 수 있다 — 이 둘이
  // 실패했을 때만 전체를 fallback으로 갈아엎는다. RPC 도입 전 코드가 지키던
  // 원칙("totalCount·recentSignatures는 여전히 신뢰할 수 있으므로 전체를
  // fallback으로 갈아엎지 않는다")을 그대로 되살린 것 — RPC를 끼워 넣으며
  // 한 번 이 원칙을 깼던 걸 되돌린다.
  const countRecentError = countResult.error ?? recentResult.error;
  if (countRecentError) {
    console.error("Failed to fetch signature stats (count/recent):", countRecentError);
    return {
      ...fallback,
      warning: isMissingSupabaseRelationError(countRecentError)
        ? formatSupabaseRelationWarning("signatures", "서명")
        : "서명 데이터를 불러오지 못했습니다. Supabase 연결 상태를 확인하세요.",
    };
  }

  const count = countResult.count;
  const recent = recentResult.data;
  const recentSignatures = (recent ?? []).map(
    (r: {
      name: string;
      email: string | null;
      message: string | null;
      created_at: string | null;
    }) => ({
      name: r.name,
      email: r.email,
      message: r.message,
      createdAt: r.created_at,
    }),
  );

  // RPC 유래 통계(지역 분포·공개 동의율·중복 후보·일별 추이)만 부분
  // fallback한다 — serviceClient가 없거나 RPC가 실패·형태 불일치여도 위에서
  // 이미 확보한 count·recentSignatures는 그대로 살려서 반환한다. count·
  // recentSignatures까지 0/빈 배열로 갈아엎으면(예전 실수) 서비스 키가
  // 회전 중일 뿐인데 화면이 "총 0건"을 보여주게 된다.
  if (!serviceClient || statsResult.error || !statsResult.data) {
    if (statsResult.error) {
      console.error("signature_admin_stats() 호출 실패:", statsResult.error);
    }
    return {
      ...fallback,
      totalCount: count ?? 0,
      recentSignatures,
      warning: !serviceClient
        ? "서명 통계 집계에 필요한 서비스 키(SUPABASE_SERVICE_ROLE_KEY)가 설정되지 않았습니다. 총 서명 수·최근 서명 목록은 정상이며, 지역·동의율·중복 후보·일별 추이만 집계되지 않았습니다."
        : "지역·동의율·중복 후보·일별 추이 통계를 불러오지 못했습니다. 총 서명 수·최근 서명 목록은 정상입니다.",
    };
  }

  const stats = statsResult.data;

  // 일별 버킷: RPC가 KST 기준으로 이미 (date, count)로 집계해 돌려준다(같은
  // kstDateKey 규칙, supabase/migrations/20260829000000). 여기서는 서명이 없는
  // 날짜도 축에서 사라지지 않도록 0으로 먼저 채운 뒤 RPC 결과를 덮어쓴다.
  const dailyMap = new Map<string, number>();
  const now = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    dailyMap.set(kstDateKey(kstDayStart(now, i).toISOString()), 0);
  }
  for (const { date, count: dayCount } of stats.dailyCounts) {
    // 버킷에 없는 날짜(경계 밖)는 무시한다. 새 키를 추가하면 차트 축이 어긋난다.
    if (dailyMap.has(date)) dailyMap.set(date, dayCount);
  }

  // 지역 분포: REGION_TOPS(17개 시·도 + 해외)를 0으로 먼저 채워, 서명이 없는
  // 지역도 목록에서 사라지지 않게 한다. 하드코딩된 별도 목록을 두지 않고
  // src/lib/regions.ts를 유일한 출처로 삼는다. RPC가 이미 '미상'을 제외하고
  // 돌려주므로 여기서 다시 걸러낼 필요는 없다.
  const regionMap = new Map<string, number>(REGION_TOPS.map((regionTop) => [regionTop, 0]));
  for (const { regionTop, count: regionCount } of stats.regionCounts) {
    regionMap.set(regionTop, regionCount);
  }

  return {
    totalCount: count ?? 0,
    recentSignatures,
    dailyCounts: Array.from(dailyMap.entries()).map(([date, cnt]) => ({
      date,
      count: cnt,
    })),
    regionCounts: REGION_TOPS.map((regionTop) => ({
      regionTop,
      count: regionMap.get(regionTop) ?? 0,
    })),
    unknownRegionCount: stats.unknownRegionCount,
    namePublicRateBase: stats.namePublicRateBase,
    namePublicRate:
      stats.namePublicRateBase > 0 ? stats.namePublicTrueCount / stats.namePublicRateBase : 0,
    // RPC가 이미 count DESC로 정렬해 돌려주지만, JSON 왕복을 거친 값의 정렬
    // 순서에 기대지 않고 화면이 요구하는 정렬(count 내림차순)을 여기서도 보장한다.
    duplicateCandidates: [...stats.duplicateCandidates].sort((a, b) => b.count - a.count),
    usingFallback: false,
    warning: null,
  };
}
