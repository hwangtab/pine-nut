"use client";

export interface PetitionProgressProps {
  count: number;
  goal: number;
  regionCount: number;
  recent24h: number;
  loading: boolean;
}

export default function PetitionProgress({
  count,
  goal,
  regionCount,
  recent24h,
  loading,
}: PetitionProgressProps) {
  const pct = goal > 0 ? Math.min(100, Math.round((count / goal) * 100)) : 0;

  return (
    <section className="paper p-6 sm:p-8" aria-label="서명 진행 현황">
      <div className="relative z-[1]">
        <div className="flex items-end justify-between mb-3">
          <p className="font-serif-display font-bold text-2xl sm:text-3xl text-[var(--color-text)]">
            {loading ? "…" : count.toLocaleString("ko-KR")}
            <span className="ml-1 text-base font-normal text-[var(--color-text-muted)]">
              / {goal.toLocaleString("ko-KR")}명
            </span>
          </p>
          <p className="text-lg font-bold text-[var(--color-forest)]">{loading ? "…" : `${pct}%`}</p>
        </div>

        {/* 로딩 중에는 채움 막대를 렌더하지 않는다 — 0% 너비 막대는 "아직
            모름"이 아니라 "0명"이라고 말한다. 옆의 숫자·퍼센트는 "…"인데
            막대만 0%면 화면이 서로 다른 말을 한다. 대신 트랙에 불확정
            스타일(animate-pulse)을 줘서 "불러오는 중"으로 읽히게 한다. */}
        <div
          className={`h-3 w-full rounded-full bg-[var(--color-bg-warm)] overflow-hidden ${
            loading ? "animate-pulse" : ""
          }`}
          role="progressbar"
          aria-busy={loading}
          aria-valuenow={loading ? undefined : pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            loading
              ? "서명 현황을 불러오는 중입니다."
              : `서명 ${count.toLocaleString("ko-KR")}명, 목표 ${goal.toLocaleString("ko-KR")}명 대비 ${pct}%`
          }
        >
          {!loading && (
            <div
              className="h-full rounded-full bg-[var(--color-forest)] transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-center">
          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">참여 지역</dt>
            <dd className="mt-1 font-serif-display font-bold text-xl text-[var(--color-text)]">
              {loading ? "…" : `${regionCount.toLocaleString("ko-KR")}곳`}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--color-text-muted)]">최근 24시간</dt>
            <dd className="mt-1 font-serif-display font-bold text-xl text-[var(--color-text)]">
              {loading ? "…" : `${recent24h.toLocaleString("ko-KR")}명`}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
