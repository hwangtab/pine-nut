"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreNewsVersionAction } from "@/lib/actions/news";
import { restorePageContentVersionAction } from "@/lib/actions/page-content";
import { restoreTimelineVersionAction } from "@/lib/actions/timeline";
import type { AuditEntry } from "@/lib/data/audit";
import type {
  VersionHistoryFilter,
  VersionHistoryManagerProps,
  VersionHistoryState,
} from "./types";

async function restoreEntry(entry: AuditEntry) {
  if (entry.table_name === "page_content") {
    return restorePageContentVersionAction(entry.payload);
  }
  if (entry.table_name === "news") {
    return restoreNewsVersionAction(entry.payload);
  }
  if (entry.table_name === "timeline_events") {
    return restoreTimelineVersionAction(entry.payload);
  }

  return { error: "복원할 수 없는 변경 내역입니다." };
}

export function useVersionHistoryManager({
  entries,
}: VersionHistoryManagerProps): VersionHistoryState {
  const router = useRouter();
  const [filter, setFilter] = useState<VersionHistoryFilter>("all");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredEntries = useMemo(
    () => (filter === "all" ? entries : entries.filter((entry) => entry.table_name === filter)),
    [entries, filter],
  );

  const handleRestore = (entry: AuditEntry) => {
    if (!window.confirm("이 버전의 이전 상태로 복원하시겠습니까?")) {
      return;
    }

    setError(null);
    setMessage(null);

    startTransition(async () => {
      const result = await restoreEntry(entry);

      if (result?.error) {
        setError(result.error);
        return;
      }

      setMessage("선택한 버전으로 복원했습니다.");
      router.refresh();
    });
  };

  return {
    filter,
    setFilter,
    filteredEntries,
    message,
    error,
    isPending,
    handleRestore,
  };
}
