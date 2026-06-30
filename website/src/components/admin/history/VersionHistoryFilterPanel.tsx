import type { VersionHistoryFilter } from "./types";

const filters: { value: VersionHistoryFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "page_content", label: "페이지" },
  { value: "news", label: "소식" },
  { value: "timeline_events", label: "타임라인" },
];

export function VersionHistoryFilterPanel({
  filter,
  setFilter,
}: {
  filter: VersionHistoryFilter;
  setFilter: (filter: VersionHistoryFilter) => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-relaxed text-[var(--color-admin-muted)]">
          <strong className="text-[var(--color-admin-text)]">page_content</strong>는 인라인
          편집과 사이트 빌더 저장을 포함합니다. 복원 전에 공개 페이지를 새 탭에서 한 번
          확인하는 흐름을 권장합니다.
        </p>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === item.value
                  ? "bg-[var(--color-forest)] text-white"
                  : "bg-[var(--color-bg)] text-[var(--color-admin-muted)] hover:bg-[var(--color-admin-border)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
