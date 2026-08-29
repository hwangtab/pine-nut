import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { REGION_TOPS } from "@/lib/regions";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";

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

/** UTC 시각을 KST 기준 YYYY-MM-DD로 바꾼다. */
function kstDateKey(iso: string): string {
  return new Date(new Date(iso).getTime() + KST_OFFSET_MS)
    .toISOString()
    .split("T")[0];
}

// Supabase PostgREST의 기본 max_rows(1000, supabase/config.toml)를 넘는 테이블은
// select()가 앞쪽 1000행만 "에러 없이" 조용히 반환한다. 이전에 signature_region_count()
// RPC 없이 select("region_top")로 전체를 끌어오려다 정확히 이 함정에 걸려 regionCount가
// 1000건을 넘는 순간부터 영구히 틀린 값이 됐던 사례가 있다(supabase/migrations/
// 20260828000000_solidarity_signatures.sql 참고). 지역 분포·공개 동의율·중복 후보·
// CSV 내보내기는 목표 서명 수(10,000명)를 감안해 range()로 페이지를 나눠 전량을
// 끌어와야 한다.
const SUPABASE_PAGE_SIZE = 1000;
// 안전판: 어떤 이유로든 루프가 끝나지 않는 상황(무한 루프)을 막는다.
// 목표 10,000명의 몇 배를 넉넉히 잡는다.
const MAX_PAGINATED_ROWS = 100_000;

interface PageResult<T> {
  data: T[] | null;
  error: PostgrestError | null;
}

/**
 * fetchPage(from, to)를 max_rows 페이지 크기로 반복 호출해 전체 행을 모은다.
 * 마지막 페이지가 페이지 크기보다 작게 오면(또는 비면) 종료한다.
 */
async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
): Promise<PageResult<T>> {
  const rows: T[] = [];
  let from = 0;
  while (from < MAX_PAGINATED_ROWS) {
    const { data, error } = await fetchPage(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) return { data: rows, error };
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }
  return { data: rows, error: null };
}

interface SignatureRegionRow {
  name: string;
  region_top: string;
  region_sub: string;
  name_public: boolean;
}

/** 지역 분포·공개 동의율·중복 후보 계산에 쓰는 전량 조회. id 기준 오름차순으로
 * range() 페이지네이션해 max_rows 상한을 우회한다(정렬 기준이 유일 PK라 페이지
 * 경계에서 행이 누락되거나 중복되지 않는다). */
function fetchAllSignatureRegionRows(
  supabase: SupabaseClient,
): Promise<PageResult<SignatureRegionRow>> {
  return fetchAllRows<SignatureRegionRow>((from, to) =>
    supabase
      .from("signatures")
      .select("name, region_top, region_sub, name_public")
      .order("id", { ascending: true })
      .range(from, to),
  );
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
  createdAt: string;
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
  created_at: string;
}

/** CSV 내보내기용 전량 조회. 같은 max_rows 함정을 피하려고 fetchAllRows로 페이지네이션한다. */
export async function getAllSignaturesForExport(
  supabase: SupabaseClient,
): Promise<{ rows: SignatureExportRow[]; error: PostgrestError | null }> {
  const { data, error } = await fetchAllRows<SignatureExportDbRow>((from, to) =>
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
  recentSignatures: { name: string; email: string; message: string | null; createdAt: string }[];
  dailyCounts: { date: string; count: number }[];
  regionCounts: SignatureRegionCount[];
  namePublicRate: number;
  duplicateCandidates: SignatureDuplicateCandidate[];
  usingFallback: boolean;
  warning: string | null;
}

export async function getSignatureStats(days = 14): Promise<SignatureStats> {
  const supabase = await createSupabaseServerClient();
  const periodDays = Math.max(1, days);

  const fallback: SignatureStats = {
    totalCount: 0,
    recentSignatures: [],
    dailyCounts: [],
    regionCounts: REGION_TOPS.map((regionTop) => ({ regionTop, count: 0 })),
    namePublicRate: 0,
    duplicateCandidates: [],
    usingFallback: true,
    warning: formatSupabaseRelationWarning("signatures", "서명"),
  };

  if (!supabase) return fallback;

  // Daily counts for chart
  // 서명자도 운영진도 한국에 있다. UTC 기준으로 날짜를 자르면 KST 00:00~09:00의
  // 서명이 전날 막대에 들어가고, 오전에는 '오늘' 막대가 통째로 비어 보인다.
  const since = kstDayStart(new Date(), periodDays - 1);
  const [countResult, recentResult, dailyResult, regionResult] = await Promise.all([
    supabase.from("signatures").select("*", { count: "exact", head: true }),
    supabase
      .from("signatures")
      .select("name, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("signatures")
      .select("created_at")
      // 구간 시작을 KST 자정으로 내림한다. 그러지 않으면 가장 왼쪽 날짜가
      // '하루치'가 아니라 '조회 시각 이후분'만 집계되어 항상 작게 나온다.
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
    fetchAllSignatureRegionRows(supabase),
  ]);

  const signatureError =
    countResult.error ?? recentResult.error ?? dailyResult.error ?? regionResult.error;

  if (signatureError) {
    console.error("Failed to fetch signature stats:", signatureError);
    return {
      ...fallback,
      warning: isMissingSupabaseRelationError(signatureError)
        ? formatSupabaseRelationWarning("signatures", "서명")
        : "서명 데이터를 불러오지 못했습니다. Supabase 연결 상태를 확인하세요.",
    };
  }

  const count = countResult.count;
  const recent = recentResult.data;
  const dailyRaw = dailyResult.data;
  const regionRaw = regionResult.data ?? [];

  const dailyMap = new Map<string, number>();
  const now = new Date();
  for (let i = periodDays - 1; i >= 0; i--) {
    dailyMap.set(kstDateKey(kstDayStart(now, i).toISOString()), 0);
  }
  dailyRaw?.forEach((row: { created_at: string }) => {
    const day = kstDateKey(row.created_at);
    // 버킷에 없는 날짜(경계 밖)는 무시한다. 새 키를 추가하면 차트 축이 어긋난다.
    if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  });

  // 지역 분포: REGION_TOPS(17개 시·도 + 해외)를 0으로 먼저 채워, 서명이 없는
  // 지역도 목록에서 사라지지 않게 한다. 하드코딩된 별도 목록을 두지 않고
  // src/lib/regions.ts를 유일한 출처로 삼는다.
  const regionMap = new Map<string, number>(REGION_TOPS.map((regionTop) => [regionTop, 0]));
  let publicCount = 0;
  const duplicateMap = new Map<string, SignatureDuplicateCandidate>();

  for (const row of regionRaw) {
    regionMap.set(row.region_top, (regionMap.get(row.region_top) ?? 0) + 1);
    if (row.name_public) publicCount += 1;

    // 이름+지역 유니크 제약을 걸지 않은 대신(동명이인 차단·명단 벽 통한 참여 여부
    // 노출 방지), 운영자가 훑어서 거를 수 있게 동일 이름+지역(시·도+시·군·구)
    // 조합만 후보로 모은다. 실제 중복 여부 판단은 운영진 몫이다.
    const key = `${row.name}|${row.region_top}|${row.region_sub}`;
    const existing = duplicateMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      duplicateMap.set(key, {
        name: row.name,
        regionTop: row.region_top,
        regionSub: row.region_sub,
        count: 1,
      });
    }
  }

  return {
    totalCount: count ?? 0,
    recentSignatures: (recent ?? []).map(
      (r: { name: string; email: string; message: string | null; created_at: string }) => ({
        name: r.name,
        email: r.email,
        message: r.message,
        createdAt: r.created_at,
      }),
    ),
    dailyCounts: Array.from(dailyMap.entries()).map(([date, cnt]) => ({
      date,
      count: cnt,
    })),
    regionCounts: REGION_TOPS.map((regionTop) => ({
      regionTop,
      count: regionMap.get(regionTop) ?? 0,
    })),
    namePublicRate: regionRaw.length > 0 ? publicCount / regionRaw.length : 0,
    duplicateCandidates: [...duplicateMap.values()]
      .filter((candidate) => candidate.count > 1)
      .sort((a, b) => b.count - a.count),
    usingFallback: false,
    warning: null,
  };
}
