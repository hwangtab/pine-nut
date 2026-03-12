"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PageContent } from "@/lib/data/page-content";
import {
  deletePageContentAction,
  savePageContentAction,
} from "@/lib/actions/page-content";

/* ───────────────────── Types ───────────────────── */

interface StagedChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
}

interface AdminEditContextType {
  /** Whether the current user is an authenticated admin */
  isAdmin: boolean;
  /** Whether edit mode is active (admin clicked the edit button) */
  isEditMode: boolean;
  /** Toggle edit mode on/off */
  toggleEditMode: () => void;
  /** Get the current value for a content key (staged change > DB override > undefined) */
  getContent: (key: string) => string | undefined;
  /** Get metadata for a content key */
  getMetadata: (key: string) => Record<string, string> | undefined;
  /** Stage a change (not yet persisted) */
  stageChange: (change: StagedChange) => void;
  /** Whether there are unsaved changes */
  hasChanges: boolean;
  /** Number of staged changes */
  changeCount: number;
  /** Persist all staged changes to Supabase */
  saveChanges: () => Promise<boolean>;
  /** Discard all staged changes */
  discardChanges: () => void;
  /** Whether a save is in progress */
  saving: boolean;
  /** Last save error, if any */
  saveError: string | null;
  /** Last selected editable key */
  selectedKey: string | null;
  /** Whether a key currently has an override or staged change */
  hasOverride: (key: string) => boolean;
  /** Revert a single key to its default (delete override) */
  revertKey: (key: string) => Promise<void>;
}

const AdminEditContext = createContext<AdminEditContextType>({
  isAdmin: false,
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

/* ───────────────────── Provider ───────────────────── */

interface AdminEditProviderProps {
  children: React.ReactNode;
  isAdmin: boolean;
  initialContent: Record<string, PageContent>;
}

export function AdminEditProvider({
  children,
  isAdmin,
  initialContent,
}: AdminEditProviderProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [stagedChanges, setStagedChanges] = useState<
    Map<string, StagedChange>
  >(new Map());
  const [dbContent, setDbContent] =
    useState<Record<string, PageContent>>(initialContent);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isEditMode) {
      setSelectedKey(null);
      return;
    }

    const updateSelectedKey = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const editable = target.closest<HTMLElement>("[data-editable-key]");
      const key = editable?.dataset.editableKey;
      if (key) {
        setSelectedKey(key);
      }
    };

    document.addEventListener("pointerdown", updateSelectedKey, true);
    document.addEventListener("focusin", updateSelectedKey);

    return () => {
      document.removeEventListener("pointerdown", updateSelectedKey, true);
      document.removeEventListener("focusin", updateSelectedKey);
    };
  }, [isEditMode]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode((prev) => {
      if (prev && stagedChanges.size > 0) {
        // Don't exit — caller should use the discard confirmation flow
        return prev;
      }
      if (prev) {
        setSaveError(null);
      }
      return !prev;
    });
  }, [stagedChanges.size]);

  const getContent = useCallback(
    (key: string): string | undefined => {
      // Staged changes take priority
      const staged = stagedChanges.get(key);
      if (staged) return staged.value;
      // Then DB overrides
      const dbRow = dbContent[key];
      if (dbRow) return dbRow.value;
      // No override — component should use its default
      return undefined;
    },
    [stagedChanges, dbContent]
  );

  const getMetadata = useCallback(
    (key: string): Record<string, string> | undefined => {
      const staged = stagedChanges.get(key);
      if (staged?.metadata) return staged.metadata;
      const dbRow = dbContent[key];
      if (dbRow?.metadata) return dbRow.metadata;
      return undefined;
    },
    [stagedChanges, dbContent]
  );

  const stageChange = useCallback((change: StagedChange) => {
    setStagedChanges((prev) => {
      const next = new Map(prev);
      next.set(change.content_key, change);
      return next;
    });
    setSaveError(null);
  }, []);

  const discardChanges = useCallback(() => {
    setStagedChanges(new Map());
    setSaveError(null);
  }, []);

  const hasOverride = useCallback(
    (key: string) => stagedChanges.has(key) || key in dbContent,
    [stagedChanges, dbContent]
  );

  const revertKey = useCallback(
    async (key: string) => {
      const dbRow = dbContent[key];

      if (!dbRow) {
        setStagedChanges((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
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

        setDbContent((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        setStagedChanges((prev) => {
          if (!prev.has(key)) return prev;
          const next = new Map(prev);
          next.delete(key);
          return next;
        });
        setSaveError(null);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : "복원 중 오류 발생");
      } finally {
        setSaving(false);
      }
    },
    [dbContent]
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
      } else {
        // Merge staged changes into dbContent
        setDbContent((prev) => {
          const next = { ...prev };
          for (const change of changes) {
            next[change.content_key] = {
              id: prev[change.content_key]?.id ?? "",
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
        });
        setStagedChanges(new Map());
        setSaveError(null);
        return true;
      }
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
    ]
  );

  return (
    <AdminEditContext.Provider value={value}>
      {children}
    </AdminEditContext.Provider>
  );
}
