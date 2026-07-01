import type { ReactNode } from "react";
import type { PageContent } from "@/lib/data/page-content";

export interface StagedChange {
  content_key: string;
  content_type: string;
  value: string;
  metadata?: Record<string, string>;
  page: string;
  section?: string;
}

export interface AdminEditContextType {
  /** Whether the current user is an authenticated admin */
  isAdmin: boolean;
  /** Whether any user (including general/pending members) is logged in */
  isLoggedIn: boolean;
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

export interface AdminEditProviderProps {
  children: ReactNode;
  isAdmin: boolean;
  isLoggedIn: boolean;
  initialContent: Record<string, PageContent>;
}
