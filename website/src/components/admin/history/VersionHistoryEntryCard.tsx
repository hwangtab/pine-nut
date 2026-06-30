import type { AuditEntry } from "@/lib/data/audit";
import { summarizePayload } from "./summarize-payload";

function isRestorable(entry: AuditEntry): boolean {
  return (
    ["page_content", "news", "timeline_events"].includes(entry.table_name) &&
    Boolean(entry.payload?.before)
  );
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
