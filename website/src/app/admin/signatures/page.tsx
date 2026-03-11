import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getSignatureStats } from "@/lib/data/signatures";

export default async function AdminSignaturesPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const stats = await getSignatureStats(14);
  const maxDaily = Math.max(...stats.dailyCounts.map((d) => d.count), 1);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">서명 현황</h1>

      {/* Total count */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-center">
        <p className="text-gray-500 mb-2 text-lg">총 서명 수</p>
        <p className="text-5xl font-bold text-orange-600">
          {stats.totalCount.toLocaleString("ko-KR")}
          <span className="text-2xl font-normal text-gray-400 ml-2">명</span>
        </p>
      </div>

      {/* Daily chart */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-4">최근 14일 서명 추이</h2>
        <div className="flex items-end gap-1 h-40">
          {stats.dailyCounts.map((day) => {
            const height = maxDaily > 0 ? (day.count / maxDaily) * 100 : 0;
            const dateLabel = day.date.slice(5); // MM-DD
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 font-medium">
                  {day.count > 0 ? day.count : ""}
                </span>
                <div
                  className="w-full bg-orange-400 rounded-t-sm min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className="text-[10px] text-gray-400 rotate-[-45deg] origin-top-left translate-y-2 whitespace-nowrap">
                  {dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent signatures */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-700 mb-4">최근 서명 목록</h2>
        {stats.recentSignatures.length === 0 ? (
          <p className="text-gray-500 text-center py-8">서명 데이터가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentSignatures.map((sig, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-800">{sig.name}</p>
                  <p className="text-sm text-gray-400">{sig.email}</p>
                  {sig.message && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{sig.message}</p>
                  )}
                </div>
                <time className="text-xs text-gray-400 shrink-0">
                  {new Date(sig.createdAt).toLocaleDateString("ko-KR")}
                </time>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
