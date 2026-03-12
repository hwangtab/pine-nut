import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  formatSupabaseRelationWarning,
  isMissingSupabaseRelationError,
} from "@/lib/supabase-errors";

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
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - (periodDays - 1));
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
      .gte("created_at", sinceDate.toISOString())
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
  for (let i = periodDays - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().split("T")[0], 0);
  }
  dailyRaw?.forEach((row: { created_at: string }) => {
    const day = row.created_at.split("T")[0];
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
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
