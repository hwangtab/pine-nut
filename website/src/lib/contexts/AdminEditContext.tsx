"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  deletePageContentAction,
  savePageContentAction,
} from "@/lib/actions/page-content";
import {
  getStoredContent,
  getStoredMetadata,
  mergeStagedChanges,
  removeContentOverride,
  reconcileSavedChanges,
  removeStagedChange,
  stageContentChange,
} from "@/lib/contexts/admin-edit/content-store";
import type {
  AdminEditContextType,
  AdminEditProviderProps,
  StagedChange,
} from "@/lib/contexts/admin-edit/types";
import useEditableSelection from "@/lib/contexts/admin-edit/useEditableSelection";

const AdminEditContext = createContext<AdminEditContextType>({
  isAdmin: false,
  isActiveAdmin: false,
  isLoggedIn: false,
  isEditMode: false,
  toggleEditMode: () => {},
  exitEditMode: () => {},
  getContent: () => undefined,
  getMetadata: () => undefined,
  stageChange: () => {},
  hasChanges: false,
  changeCount: 0,
  saveChanges: async () => false,
  discardChanges: () => {},
  saving: false,
  saveError: null,
  selectedKey: null,
  hasOverride: () => false,
  revertKey: async () => {},
});

export function useAdminEdit() {
  return useContext(AdminEditContext);
}

export function AdminEditProvider({
  children,
  isAdmin,
  isActiveAdmin,
  isLoggedIn,
  initialContent,
}: AdminEditProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [stagedChanges, setStagedChanges] = useState<
    Map<string, StagedChange>
  >(new Map());
  const [dbContent, setDbContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { selectedKey, resetSelectedKey } = useEditableSelection(isEditMode);

  // 저장하지 않은 변경이 있을 때의 확인 다이얼로그는 툴바(useAdminToolbar)가 담당한다.
  // 여기서 다시 막으면, 다이얼로그의 "저장 후 종료"/"버리기"가 이 가드에 걸려
  // 편집 모드가 꺼지지 않는다(호출 시점의 stagedChanges를 클로저로 읽기 때문).
  const exitEditMode = useCallback(() => {
    setSaveError(null);
    resetSelectedKey();
    setIsEditMode(false);
  }, [resetSelectedKey]);

  const toggleEditMode = useCallback(() => {
    if (isEditMode) {
      exitEditMode();
      return;
    }
    setIsEditMode(true);
  }, [isEditMode, exitEditMode]);

  const getContent = useCallback(
    (key: string): string | undefined =>
      getStoredContent(key, stagedChanges, dbContent),
    [stagedChanges, dbContent],
  );

  const getMetadata = useCallback(
    (key: string): Record<string, string> | undefined =>
      getStoredMetadata(key, stagedChanges, dbContent),
    [stagedChanges, dbContent],
  );

  const stageChange = useCallback(
    (change: StagedChange) => {
      // 편집을 시작한 시점의 DB 값을 함께 실어 둔다. 저장할 때 서버가 이 값과
      // 현재 DB 값을 대조해, 그 사이 다른 관리자가 저장했으면 덮어쓰지 않는다.
      // 같은 키를 여러 번 고쳐도 최초 스테이징 때의 기준값을 유지해야 한다.
      setStagedChanges((prev) =>
        stageContentChange(prev, {
          ...change,
          base_value:
            prev.get(change.content_key)?.base_value ??
            dbContent[change.content_key]?.value ??
            null,
        }),
      );
      setSaveError(null);
    },
    [dbContent],
  );

  const discardChanges = useCallback(() => {
    setStagedChanges(new Map());
    setSaveError(null);
  }, []);

  const hasOverride = useCallback(
    (key: string) => stagedChanges.has(key) || key in dbContent,
    [stagedChanges, dbContent],
  );

  const revertKey = useCallback(
    async (key: string) => {
      const dbRow = dbContent[key];

      if (!dbRow) {
        setStagedChanges((prev) => removeStagedChange(prev, key));
        setSaveError(null);
        return;
      }

      setSaving(true);
      try {
        const result = await deletePageContentAction(key, dbRow.page);
        if (result.error) {
          setSaveError(result.error);
          return;
        }

        setDbContent((prev) => removeContentOverride(prev, key));
        setStagedChanges((prev) => removeStagedChange(prev, key));
        setSaveError(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "복원 중 오류 발생");
      } finally {
        setSaving(false);
      }
    },
    [dbContent],
  );

  const saveChanges = useCallback(async () => {
    if (stagedChanges.size === 0) return true;

    const changes = Array.from(stagedChanges.values());

    setSaving(true);
    try {
      const result = await savePageContentAction(changes);
      if (result.error) {
        setSaveError(result.error);
        return false;
      }

      setDbContent((prev) => mergeStagedChanges(prev, changes));
      // 저장 중에 사용자가 추가로 편집했을 수 있다. 저장된 항목은 걷어내고,
      // 재편집된 항목은 base_value를 방금 저장한 값으로 맞춰 둔다
      // (그러지 않으면 다음 저장이 충돌로 영구 거부된다).
      setStagedChanges((prev) => reconcileSavedChanges(prev, changes));
      setSaveError(null);
      return true;
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 중 오류 발생");
      return false;
    } finally {
      setSaving(false);
    }
  }, [stagedChanges]);

  const value = useMemo<AdminEditContextType>(
    () => ({
      isAdmin,
      isActiveAdmin,
      isLoggedIn,
      isEditMode,
      toggleEditMode,
      exitEditMode,
      getContent,
      getMetadata,
      stageChange,
      hasChanges: stagedChanges.size > 0,
      changeCount: stagedChanges.size,
      saveChanges,
      discardChanges,
      saving,
      saveError,
      selectedKey,
      hasOverride,
      revertKey,
    }),
    [
      isAdmin,
      isActiveAdmin,
      isLoggedIn,
      isEditMode,
      toggleEditMode,
      exitEditMode,
      getContent,
      getMetadata,
      stageChange,
      stagedChanges,
      saveChanges,
      discardChanges,
      saving,
      saveError,
      selectedKey,
      hasOverride,
      revertKey,
    ],
  );

  return (
    <AdminEditContext.Provider value={value}>
      {children}
    </AdminEditContext.Provider>
  );
}
