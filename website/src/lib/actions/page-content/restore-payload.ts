import type { ContentChange } from "@/lib/actions/page-content/types";

/**
 * 그 저장으로 "새로 생긴" 키 목록을 뽑는다(after에는 있고 before에는 없는 키).
 * 복원은 before를 되돌리는 것만으로는 부족하다. 새로 생긴 override는 지워야
 * 편집 이전 상태(하드코딩 기본값)로 실제로 돌아간다.
 */
export function parsePageContentCreatedKeys(
  payload: Record<string, unknown> | null | undefined,
): string[] {
  if (!payload || typeof payload !== "object") return [];

  const keysOf = (value: unknown): Set<string> => {
    const list = Array.isArray(value) ? value : value && typeof value === "object" ? [value] : [];
    const keys = new Set<string>();
    for (const row of list) {
      if (row && typeof row === "object") {
        const key = (row as Record<string, unknown>).content_key;
        if (typeof key === "string" && key) keys.add(key);
      }
    }
    return keys;
  };

  const before = keysOf(payload.before);
  return [...keysOf(payload.after)].filter((key) => !before.has(key));
}

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
