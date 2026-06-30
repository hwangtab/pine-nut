"use client";

import AdminToolbarDialogs from "@/components/admin/AdminToolbarDialogs";
import { AdminToolbarMain } from "@/components/admin/toolbar/AdminToolbarMain";
import { AdminToolbarNotice } from "@/components/admin/toolbar/AdminToolbarNotice";
import { AdminToolbarToast } from "@/components/admin/toolbar/AdminToolbarToast";
import { useAdminToolbar } from "@/components/admin/toolbar/useAdminToolbar";

export default function AdminToolbar() {
  const toolbar = useAdminToolbar();

  if (!toolbar.isAdmin) return null;

  return (
    <>
      <AdminToolbarMain
        isEditMode={toolbar.isEditMode}
        hasChanges={toolbar.hasChanges}
        changeCount={toolbar.changeCount}
        saving={toolbar.saving}
        selectedKey={toolbar.selectedKey}
        selectedKeyHasOverride={toolbar.selectedKeyHasOverride}
        saveChanges={toolbar.saveChanges}
        discardChanges={toolbar.discardChanges}
        handleToggleEditMode={toolbar.handleToggleEditMode}
        handleShowRevertConfirm={toolbar.handleShowRevertConfirm}
      />

      {toolbar.isEditMode && !toolbar.saveError && <AdminToolbarNotice />}
      {toolbar.saveError && <AdminToolbarToast saveError={toolbar.saveError} />}

      <AdminToolbarDialogs
        showConfirmDiscard={toolbar.showConfirmDiscard}
        showConfirmRevert={toolbar.showConfirmRevert}
        changeCount={toolbar.changeCount}
        selectedKey={toolbar.selectedKey}
        saving={toolbar.saving}
        onCancelDiscard={toolbar.handleCancelDiscard}
        onSaveAndExit={toolbar.handleSaveAndExit}
        onDiscardAndExit={toolbar.handleDiscardAndExit}
        onCancelRevert={toolbar.handleCancelRevert}
        onConfirmRevert={toolbar.handleConfirmRevert}
      />
    </>
  );
}
