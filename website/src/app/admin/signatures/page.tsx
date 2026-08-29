import { getSignatureStats } from "@/lib/data/signatures";

export default async function AdminSignaturesPage() {
  const stats = await getSignatureStats(14);
  const maxDaily = Math.max(...stats.dailyCounts.map((d) => d.count), 1);
  const maxRegion = Math.max(
    ...stats.regionCounts.map((r) => r.count),
    stats.unknownRegionCount,
    1,
  );
  const activeRegions = stats.regionCounts
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
  const hasRegionData = activeRegions.length > 0 || stats.unknownRegionCount > 0;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">서명 현황</h1>
        {/* /api/admin/signatures/export는 src/proxy.ts 미들웨어 밖이라 라우트 자체가
            requireActiveAdmin()으로 권한을 확인한다 — 관리자가 아니면 403. */}
        <a
          href="/api/admin/signatures/export"
          className="rounded-full bg-[var(--color-warm)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          CSV 내보내기
        </a>
      </div>

      {stats.warning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
          {stats.warning}
          {stats.usingFallback && " 현재 수치는 fallback 상태 기준이며 실제 운영 데이터가 아닐 수 있습니다."}
        </div>
      )}

      {/* Total count + public consent rate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 sm:p-8 text-center">
          <p className="text-[var(--color-admin-muted)] mb-2 text-lg">총 서명 수</p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-warm)]">
            {stats.totalCount.toLocaleString("ko-KR")}
            <span className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--color-admin-muted)]/70 ml-2">명</span>
          </p>
        </div>
        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 sm:p-8 text-center">
          <p className="text-[var(--color-admin-muted)] mb-2 text-lg">이름 공개 동의율</p>
          <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-forest)]">
            {Math.round(stats.namePublicRate * 100)}
            <span className="text-lg sm:text-xl md:text-2xl font-normal text-[var(--color-admin-muted)]/70 ml-2">%</span>
          </p>
        </div>
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

      {/* Region distribution */}
      <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 mb-8">
        <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">지역 분포 (시·도)</h2>
        {!hasRegionData ? (
          <p className="text-[var(--color-admin-muted)] text-center py-4">서명 데이터가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {activeRegions.map((region) => (
              <div key={region.regionTop} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-[var(--color-admin-text)]">{region.regionTop}</span>
                <div className="flex-1 h-3 rounded-full bg-[var(--color-admin-border)] overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-sky)]"
                    style={{ width: `${(region.count / maxRegion) * 100}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-sm text-[var(--color-admin-muted)]">
                  {region.count}
                </span>
              </div>
            ))}
            {stats.unknownRegionCount > 0 && (
              <>
                {/* 지역 미상: 2026-08-28 이전 서명 65건(지역 미수집)을 백필한
                    '미상' 센티넬. 18개 시·도와 섞이지 않도록 구분선 아래,
                    다른 색조(sky 대신 amber)로 별도 표기한다. */}
                <div className="border-t border-dashed border-[var(--color-admin-border)] my-3" />
                <div className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-sm text-amber-700">지역 미상</span>
                  <div className="flex-1 h-3 rounded-full bg-[var(--color-admin-border)] overflow-hidden">
                    <div
                      className="h-full bg-amber-400"
                      style={{ width: `${(stats.unknownRegionCount / maxRegion) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm text-amber-700">
                    {stats.unknownRegionCount}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-admin-muted)]/70 pl-0">
                  2026-08-28 이전 서명 — 지역 정보 없이 접수됨
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Duplicate candidates */}
      {stats.duplicateCandidates.length > 0 && (
        <div className="bg-[var(--color-admin-surface)] rounded-2xl border border-amber-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-1">중복 서명 후보</h2>
          <p className="text-sm text-[var(--color-admin-muted)] mb-4">
            동일한 이름·지역 조합이 여러 번 등록됐습니다. 실제 중복인지는 운영진이 판단해주세요.
          </p>
          <div className="space-y-2">
            {stats.duplicateCandidates.map((c) => (
              <div
                key={`${c.name}-${c.regionTop}-${c.regionSub}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-[var(--color-admin-text)]">
                  {c.name} · {c.regionTop} {c.regionSub}
                </span>
                <span className="text-[var(--color-admin-muted)]">{c.count}건</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
