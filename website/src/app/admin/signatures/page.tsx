import { getSignatureStats } from "@/lib/data/signatures";

export default async function AdminSignaturesPage() {
  const stats = await getSignatureStats(14);
  const maxDaily = Math.max(...stats.dailyCounts.map((d) => d.count), 1);

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-8">서명 현황</h1>

      {stats.warning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
          {stats.warning}
          {stats.usingFallback && " 현재 수치는 fallback 상태 기준이며 실제 운영 데이터가 아닐 수 있습니다."}
        </div>
      )}

      {/* Total count */}
      <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 sm:p-8 mb-8 text-center">
        <p className="text-[var(--color-admin-muted)] mb-2 text-lg">총 서명 수</p>
        <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-warm)]">
          {stats.totalCount.toLocaleString("ko-KR")}
          <span className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--color-admin-muted)]/70 ml-2">명</span>
        </p>
      </div>

      {/* Daily chart */}
      <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 mb-8 overflow-hidden">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">최근 14일 서명 추이</h2>
        <div className="flex items-end gap-1 h-32 sm:h-40 pb-8">
          {stats.dailyCounts.map((day, i) => {
            const height = maxDaily > 0 ? (day.count / maxDaily) * 100 : 0;
            const dateLabel = day.date.slice(5); // MM-DD
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-[var(--color-admin-muted)] font-medium">
                  {day.count > 0 ? day.count : ""}
                </span>
                <div
                  className="w-full bg-[var(--color-warm)] rounded-t-sm min-h-[2px]"
                  style={{ height: `${Math.max(height, 2)}%` }}
                />
                <span className={`text-[10px] text-[var(--color-admin-muted)]/70 rotate-[-45deg] origin-top-left translate-y-2 whitespace-nowrap${i % 2 !== 0 ? " hidden sm:inline" : ""}`}>
                  {dateLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent signatures */}
      <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">최근 서명 목록</h2>
        {stats.recentSignatures.length === 0 ? (
          <p className="text-[var(--color-admin-muted)] text-center py-8">서명 데이터가 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {stats.recentSignatures.map((sig, i) => (
              <div key={i} className="flex items-start justify-between gap-4 py-3 border-b border-[var(--color-admin-border)] last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--color-admin-text)]">{sig.name}</p>
                  <p className="text-sm text-[var(--color-admin-muted)]/70">{sig.email}</p>
                  {sig.message && (
                    <p className="text-sm text-[var(--color-admin-muted)] mt-1 line-clamp-2">{sig.message}</p>
                  )}
                </div>
                <time dateTime={sig.createdAt} className="text-xs text-[var(--color-admin-muted)]/70 shrink-0">
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
