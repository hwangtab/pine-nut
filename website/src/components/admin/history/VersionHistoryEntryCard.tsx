import type { AuditEntry } from "@/lib/data/audit";
import { summarizePayload } from "./summarize-payload";

function isRestorable(entry: AuditEntry): boolean {
  if (!["page_content", "news", "timeline_events"].includes(entry.table_name)) {
    return false;
  }
  const before = entry.payload?.before;
  // 빈 배열도 truthy다. 그대로 두면 "최초 편집" 기록에 복원 버튼이 뜨고,
  // 누르면 되돌릴 이전 값이 없어 항상 실패한다.
  // 단, page_content는 after만 있어도 "새로 생긴 override 삭제"로 복원할 수 있다.
  if (Array.isArray(before)) {
    return before.length > 0 || (entry.table_name === "page_content" && Boolean(entry.payload?.after));
  }
  return Boolean(before);
}

export function VersionHistoryEntryCard({
  entry,
  isPending,
  handleRestore,
}: {
  entry: AuditEntry;
  isPending: boolean;
  handleRestore: (entry: AuditEntry) => void;
}) {
  return (
    <div className="rounded-3xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-admin-muted)]">
              {entry.table_name}
            </span>
            <span className="rounded-full bg-[var(--color-forest)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-forest)]">
              {entry.action}
            </span>
          </div>
          <h2 className="text-lg font-bold text-[var(--color-admin-text)]">
            {summarizePayload(entry)}
          </h2>
          <div className="text-sm text-[var(--color-admin-muted)]">
            {entry.user_email} ·{" "}
            {new Intl.DateTimeFormat("ko-KR", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(entry.created_at))}
          </div>
          {entry.entity_key && (
            <div className="text-sm font-mono text-[var(--color-admin-muted)]">
              {entry.entity_key}
            </div>
          )}
        </div>

        {isRestorable(entry) && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleRestore(entry)}
            className="rounded-xl bg-[var(--color-forest)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-40"
          >
            {isPending ? "복원 중..." : "이 버전 복원"}
          </button>
        )}
      </div>
    </div>
  );
}
