import type { AuditEntry } from "@/lib/data/audit";

export type VersionHistoryFilter = "all" | "page_content" | "news" | "timeline_events";

export interface VersionHistoryManagerProps {
  entries: AuditEntry[];
}

export interface VersionHistoryState {
  filter: VersionHistoryFilter;
  setFilter: (filter: VersionHistoryFilter) => void;
  filteredEntries: AuditEntry[];
  message: string | null;
  error: string | null;
  isPending: boolean;
  handleRestore: (entry: AuditEntry) => void;
}
