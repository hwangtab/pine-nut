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

export interface SignatureStats {
  totalCount: number;
  recentSignatures: { name: string; email: string; message: string | null; createdAt: string }[];
  dailyCounts: { date: string; count: number }[];
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
    usingFallback: true,
    warning: formatSupabaseRelationWarning("signatures", "서명"),
  };

  if (!supabase) return fallback;

  // Daily counts for chart
  // 서명자도 운영진도 한국에 있다. UTC 기준으로 날짜를 자르면 KST 00:00~09:00의
  // 서명이 전날 막대에 들어가고, 오전에는 '오늘' 막대가 통째로 비어 보인다.
  const since = kstDayStart(new Date(), periodDays - 1);
  const [countResult, recentResult, dailyResult] = await Promise.all([
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
  ]);

  const signatureError =
    countResult.error ?? recentResult.error ?? dailyResult.error;

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

  return {
    totalCount: count ?? 0,
    recentSignatures: (recent ?? []).map((r: { name: string; email: string; message: string | null; created_at: string }) => ({
      name: r.name,
      email: r.email,
      message: r.message,
      createdAt: r.created_at,
    })),
    dailyCounts: Array.from(dailyMap.entries()).map(([date, cnt]) => ({
      date,
      count: cnt,
    })),
    usingFallback: false,
    warning: null,
  };
}
