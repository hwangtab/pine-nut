"use client";

import { VersionHistoryFilterPanel } from "@/components/admin/history/VersionHistoryFilterPanel";
import { VersionHistoryHeader } from "@/components/admin/history/VersionHistoryHeader";
import { VersionHistoryList } from "@/components/admin/history/VersionHistoryList";
import { VersionHistoryStatus } from "@/components/admin/history/VersionHistoryStatus";
import type { VersionHistoryManagerProps } from "@/components/admin/history/types";
import { useVersionHistoryManager } from "@/components/admin/history/useVersionHistoryManager";

export default function VersionHistoryManager({
  entries,
}: VersionHistoryManagerProps) {
  const history = useVersionHistoryManager({ entries });

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <VersionHistoryHeader />
      <VersionHistoryFilterPanel
        filter={history.filter}
        setFilter={history.setFilter}
      />
      <VersionHistoryStatus message={history.message} error={history.error} />
      <VersionHistoryList
        filteredEntries={history.filteredEntries}
        isPending={history.isPending}
        handleRestore={history.handleRestore}
      />
    </div>
  );
}
