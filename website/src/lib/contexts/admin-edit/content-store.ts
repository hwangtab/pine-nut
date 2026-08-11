import type { PageContent } from "@/lib/data/page-content";
import type { StagedChange } from "@/lib/contexts/admin-edit/types";

export function getStoredContent(
  key: string,
  stagedChanges: Map<string, StagedChange>,
  dbContent: Record<string, PageContent>,
): string | undefined {
  const staged = stagedChanges.get(key);
  if (staged) return staged.value;

  const dbRow = dbContent[key];
  if (dbRow) return dbRow.value;

  return undefined;
}

export function getStoredMetadata(
  key: string,
  stagedChanges: Map<string, StagedChange>,
  dbContent: Record<string, PageContent>,
): Record<string, string> | undefined {
  const staged = stagedChanges.get(key);
  if (staged?.metadata) return staged.metadata;

  const dbRow = dbContent[key];
  if (dbRow?.metadata) return dbRow.metadata;

  return undefined;
}

export function stageContentChange(
  current: Map<string, StagedChange>,
  change: StagedChange,
): Map<string, StagedChange> {
  const next = new Map(current);
  next.set(change.content_key, change);
  return next;
}

export function removeStagedChange(
  current: Map<string, StagedChange>,
  key: string,
): Map<string, StagedChange> {
  if (!current.has(key)) return current;

  const next = new Map(current);
  next.delete(key);
  return next;
}

/**
 * 저장이 끝난 변경을 스테이징에서 정리한다.
 *
 * - 그대로 남아 있는 항목(참조 동일) → 제거
 * - 저장 중에 다시 편집된 항목 → 남기되, base_value를 **방금 저장한 값**으로 갱신
 *
 * 두 번째가 중요하다. base_value를 낡은 채로 두면 서버의 동시 편집 검사가
 * "다른 관리자가 먼저 저장했다"고 영구히 거부해, 그 키가 섞인 배치가 다시는
 * 저장되지 않는다(자기 회복 경로가 없음).
 */
export function reconcileSavedChanges(
  current: Map<string, StagedChange>,
  saved: StagedChange[],
): Map<string, StagedChange> {
  const next = new Map(current);
  for (const change of saved) {
    const staged = next.get(change.content_key);
    if (!staged) continue;
    if (staged === change) {
      next.delete(change.content_key);
    } else {
      next.set(change.content_key, { ...staged, base_value: change.value });
    }
  }
  return next;
}

export function removeContentOverride(
  current: Record<string, PageContent>,
  key: string,
): Record<string, PageContent> {
  const next = { ...current };
  delete next[key];
  return next;
}

export function mergeStagedChanges(
  current: Record<string, PageContent>,
  changes: StagedChange[],
): Record<string, PageContent> {
  const next = { ...current };

  for (const change of changes) {
    next[change.content_key] = {
      id: current[change.content_key]?.id ?? "",
      content_key: change.content_key,
      content_type: change.content_type,
      value: change.value,
      metadata: change.metadata ?? {},
      page: change.page,
      section: change.section ?? null,
      updated_at: new Date().toISOString(),
      updated_by: "",
    };
  }

  return next;
}
