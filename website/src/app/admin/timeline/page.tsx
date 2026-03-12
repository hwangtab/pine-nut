import Link from "next/link";
import { getAllTimeline } from "@/lib/data/timeline";
import TimelineListActions from "./TimelineListActions";

const PER_PAGE = 20;

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function AdminTimelinePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const query = params.q ?? "";
  const {
    items: allTimeline,
    total,
    usingFallback,
    warning,
  } = await getAllTimeline({ page, perPage: PER_PAGE, query });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)]">타임라인 관리</h1>
        <Link
          href="/admin/timeline/new"
          className="px-6 py-3 bg-[var(--color-sky)] text-white font-bold rounded-xl hover:bg-[var(--color-forest)] transition-colors text-base"
        >
          + 새 이벤트
        </Link>
      </div>

      <form method="get" className="mb-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="제목으로 검색..."
            className="flex-1 px-4 py-3 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-sky)]/40 focus:border-[var(--color-sky)] outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[var(--color-bg)] text-[var(--color-admin-text)] font-bold rounded-xl hover:bg-[var(--color-admin-border)] transition-colors"
          >
            검색
          </button>
        </div>
      </form>

      {warning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-800">
          {warning}
          {usingFallback && " 아래 목록은 수정 가능한 실제 DB 항목이 아니라 임시 fallback 데이터입니다."}
        </div>
      )}

      {allTimeline.length === 0 ? (
        <p className="text-[var(--color-admin-muted)] text-center py-20">
          {query ? `"${query}" 검색 결과가 없습니다.` : "등록된 타임라인 이벤트가 없습니다."}
        </p>
      ) : (
        <>
          <p className="text-base text-[var(--color-admin-muted)] mb-4">총 {total}건</p>
          <div className="space-y-3">
            {allTimeline.map((item) => (
              <div
                key={item.id}
                className={`bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between ${
                  item.isDeleted ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-[var(--color-admin-muted)] bg-[var(--color-bg)] px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.isDeleted && (
                      <span className="text-sm font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-2 py-0.5 rounded">
                        삭제됨
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[var(--color-admin-text)]">{item.title}</h3>
                  <p className="text-base text-[var(--color-admin-muted)]">
                    {item.date} · {item.year}년
                  </p>
                </div>

                {usingFallback ? (
                  <span className="shrink-0 rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-800">
                    읽기 전용
                  </span>
                ) : (
                  <TimelineListActions id={item.id} isDeleted={item.isDeleted} />
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              {page > 1 && (
                <Link
                  href={`/admin/timeline?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className="px-5 py-3 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-xl font-bold text-[var(--color-admin-text)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  ← 이전
                </Link>
              )}
              <span className="text-base text-[var(--color-admin-muted)]">{page} / {totalPages}</span>
              {page < totalPages && (
                <Link
                  href={`/admin/timeline?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className="px-5 py-3 bg-[var(--color-admin-surface)] border border-[var(--color-admin-border)] rounded-xl font-bold text-[var(--color-admin-text)] hover:bg-[var(--color-bg)] transition-colors"
                >
                  다음 →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
