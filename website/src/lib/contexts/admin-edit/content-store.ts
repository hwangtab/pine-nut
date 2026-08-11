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
 * 저장이 끝난 변경만 스테이징에서 제거한다.
 * 통째로 비우면 저장이 진행되는 동안 사용자가 추가로 편집한 내용까지 사라진다.
 * 같은 키를 다시 편집했다면(값이 다르면) 그 편집은 남겨 둔다.
 */
export function removeSavedChanges(
  current: Map<string, StagedChange>,
  saved: StagedChange[],
): Map<string, StagedChange> {
  const next = new Map(current);
  for (const change of saved) {
    if (next.get(change.content_key) === change) {
      next.delete(change.content_key);
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
