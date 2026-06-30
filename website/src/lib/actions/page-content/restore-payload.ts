import type { ContentChange } from "@/lib/actions/page-content/types";

export function parsePageContentRestoreRows(
  payload: Record<string, unknown> | null | undefined,
): { rows: ContentChange[]; error: string | null } {
  const normalizedPayload =
    payload && typeof payload === "object" ? payload : null;

  if (!normalizedPayload) {
    return { rows: [], error: "복원할 버전 데이터가 없습니다." };
  }

  const before = Array.isArray(normalizedPayload.before)
    ? normalizedPayload.before
    : normalizedPayload.before && typeof normalizedPayload.before === "object"
      ? [normalizedPayload.before]
      : [];

  if (before.length === 0) {
    return { rows: [], error: "복원 가능한 이전 데이터가 없습니다." };
  }

  const rows = before
    .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
    .map((row) => ({
      content_key: typeof row.content_key === "string" ? row.content_key : "",
      content_type: typeof row.content_type === "string" ? row.content_type : "",
      value: typeof row.value === "string" ? row.value : "",
      metadata:
        row.metadata && typeof row.metadata === "object"
          ? (row.metadata as Record<string, string>)
          : {},
      page: typeof row.page === "string" ? row.page : "",
      section: typeof row.section === "string" ? row.section : undefined,
    }))
    .filter((row) => row.content_key && row.content_type && row.page);

  if (rows.length === 0) {
    return { rows, error: "복원 가능한 이전 데이터가 없습니다." };
  }

  return { rows, error: null };
}
