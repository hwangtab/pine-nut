"use client";

import { useCallback, useState } from "react";
import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import type { AdminToolbarState } from "./types";

export function useAdminToolbar(): AdminToolbarState {
  const {
    isAdmin,
    isEditMode,
    toggleEditMode,
    exitEditMode,
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

  // toggleEditMode 대신 exitEditMode를 쓴다. toggleEditMode는 호출 시점의 상태를
  // 클로저로 읽어, 방금 저장/폐기한 것이 아직 반영되지 않은 상태에서 종료를 거부한다.
  const handleSaveAndExit = useCallback(async () => {
    const didSave = await saveChanges();
    if (didSave) {
      setShowConfirmDiscard(false);
      exitEditMode();
    }
  }, [saveChanges, exitEditMode]);

  const handleDiscardAndExit = useCallback(() => {
    discardChanges();
    setShowConfirmDiscard(false);
    exitEditMode();
  }, [discardChanges, exitEditMode]);

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
