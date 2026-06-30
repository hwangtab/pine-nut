import type { AuditEntry } from "@/lib/data/audit";

function payloadCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  return value ? 1 : 0;
}

function payloadTitle(value: unknown): string | null {
  return typeof value === "object" && value && "title" in value
    ? (value.title as string)
    : null;
}

export function summarizePayload(entry: AuditEntry): string {
  const before = payloadCount(entry.payload?.before);
  const after = payloadCount(entry.payload?.after);

  if (entry.table_name === "page_content") {
    if (entry.action === "bulk_update") {
      return `${after}개 편집 항목 저장`;
    }
    if (entry.action === "delete") {
      return `${before}개 편집 항목 기본값 복원`;
    }
  }

  const label =
    entry.table_name === "news"
      ? payloadTitle(entry.payload?.after) ?? payloadTitle(entry.payload?.before) ?? "소식 항목"
      : entry.table_name === "timeline_events"
        ? payloadTitle(entry.payload?.after) ??
          payloadTitle(entry.payload?.before) ??
          "타임라인 항목"
        : null;

  return label ? `${label} · ${entry.action}` : `${entry.table_name} ${entry.action}`;
}
