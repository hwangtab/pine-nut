import type { AuditEntry } from "@/lib/data/audit";
import { VersionHistoryEntryCard } from "./VersionHistoryEntryCard";

export function VersionHistoryList({
  filteredEntries,
  isPending,
  handleRestore,
}: {
  filteredEntries: AuditEntry[];
  isPending: boolean;
  handleRestore: (entry: AuditEntry) => void;
}) {
  return (
    <div className="space-y-4">
      {filteredEntries.map((entry) => (
        <VersionHistoryEntryCard
          key={entry.id}
          entry={entry}
          isPending={isPending}
          handleRestore={handleRestore}
        />
      ))}

      {filteredEntries.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[var(--color-admin-border)] px-6 py-16 text-center text-[var(--color-admin-muted)]">
          아직 기록된 변경 내역이 없습니다.
        </div>
      )}
    </div>
  );
}
