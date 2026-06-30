"use client";

import { useCallback, useState } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import type { AdminToolbarState } from "./types";

export function useAdminToolbar(): AdminToolbarState {
  const {
    isAdmin,
    isEditMode,
    toggleEditMode,
    hasChanges,
    changeCount,
    saveChanges,
    discardChanges,
    saving,
    saveError,
    selectedKey,
    hasOverride,
    revertKey,
  } = useAdminEdit();

  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showConfirmRevert, setShowConfirmRevert] = useState(false);
  const selectedKeyHasOverride = selectedKey ? hasOverride(selectedKey) : false;

  const handleToggleEditMode = useCallback(() => {
    if (isEditMode && hasChanges) {
      setShowConfirmDiscard(true);
      return;
    }
    toggleEditMode();
  }, [hasChanges, isEditMode, toggleEditMode]);

  const handleSaveAndExit = useCallback(async () => {
    const didSave = await saveChanges();
    if (didSave) {
      setTimeout(() => {
        setShowConfirmDiscard(false);
        toggleEditMode();
      }, 100);
    }
  }, [saveChanges, toggleEditMode]);

  const handleDiscardAndExit = useCallback(() => {
    discardChanges();
    setShowConfirmDiscard(false);
    toggleEditMode();
  }, [discardChanges, toggleEditMode]);

  const handleShowRevertConfirm = useCallback(() => {
    if (!selectedKeyHasOverride || saving) return;
    setShowConfirmRevert(true);
  }, [saving, selectedKeyHasOverride]);

  const handleConfirmRevert = useCallback(async () => {
    if (!selectedKey) return;
    await revertKey(selectedKey);
    setShowConfirmRevert(false);
  }, [revertKey, selectedKey]);

  return {
    isAdmin,
    isEditMode,
    hasChanges,
    changeCount,
    saving,
    saveError,
    selectedKey,
    selectedKeyHasOverride,
    showConfirmDiscard,
    showConfirmRevert,
    saveChanges,
    discardChanges,
    handleToggleEditMode,
    handleShowRevertConfirm,
    handleCancelDiscard: () => setShowConfirmDiscard(false),
    handleSaveAndExit,
    handleDiscardAndExit,
    handleCancelRevert: () => setShowConfirmRevert(false),
    handleConfirmRevert,
  };
}
