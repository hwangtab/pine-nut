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
  isLoggedIn: false,
  isEditMode: false,
  toggleEditMode: () => {},
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

  const toggleEditMode = useCallback(() => {
    if (isEditMode && stagedChanges.size > 0) {
      return;
    }
    if (isEditMode) {
      setSaveError(null);
      resetSelectedKey();
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode, resetSelectedKey, stagedChanges.size]);

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

  const stageChange = useCallback((change: StagedChange) => {
    setStagedChanges((prev) => stageContentChange(prev, change));
    setSaveError(null);
  }, []);

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
      setStagedChanges(new Map());
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
      isLoggedIn,
      isEditMode,
      toggleEditMode,
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
      isLoggedIn,
      isEditMode,
      toggleEditMode,
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
