import { createSupabaseServerClient } from "@/lib/supabase-server";

export interface SignatureStats {
  totalCount: number;
  recentSignatures: { name: string; email: string; message: string | null; createdAt: string }[];
  dailyCounts: { date: string; count: number }[];
}

export async function getSignatureStats(days = 14): Promise<SignatureStats> {
  const supabase = await createSupabaseServerClient();

  const fallback: SignatureStats = {
    totalCount: 0,
    recentSignatures: [],
    dailyCounts: [],
  };

  if (!supabase) return fallback;

  // Total count
  const { count } = await supabase
    .from("signatures")
    .select("*", { count: "exact", head: true });

  // Recent 20
  const { data: recent } = await supabase
    .from("signatures")
    .select("name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(20);

  // Daily counts for chart
  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);
  const { data: dailyRaw } = await supabase
    .from("signatures")
    .select("created_at")
    .gte("created_at", sinceDate.toISOString())
    .order("created_at", { ascending: true });

  const dailyMap = new Map<string, number>();
  // Pre-fill all days
  for (let i = days; i >= 0; i--) {
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
  };
}
