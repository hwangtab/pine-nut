"use client";

import { DiscardChangesDialog } from "@/components/admin/dialogs/DiscardChangesDialog";
import { RevertKeyDialog } from "@/components/admin/dialogs/RevertKeyDialog";

export default function AdminToolbarDialogs({
  showConfirmDiscard,
  showConfirmRevert,
  changeCount,
  selectedKey,
  saving,
  onCancelDiscard,
  onSaveAndExit,
  onDiscardAndExit,
  onCancelRevert,
  onConfirmRevert,
}: {
  showConfirmDiscard: boolean;
  showConfirmRevert: boolean;
  changeCount: number;
  selectedKey: string | null;
  saving: boolean;
  onCancelDiscard: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  onCancelRevert: () => void;
  onConfirmRevert: () => void;
}) {
  return (
    <>
      <DiscardChangesDialog
        open={showConfirmDiscard}
        changeCount={changeCount}
        saving={saving}
        onCancel={onCancelDiscard}
        onSaveAndExit={onSaveAndExit}
        onDiscardAndExit={onDiscardAndExit}
      />
      <RevertKeyDialog
        open={showConfirmRevert}
        selectedKey={selectedKey}
        saving={saving}
        onCancel={onCancelRevert}
        onConfirm={onConfirmRevert}
      />
    </>
  );
}
