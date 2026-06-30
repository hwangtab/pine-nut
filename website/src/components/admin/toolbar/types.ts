export interface AdminToolbarState {
  isAdmin: boolean;
  isEditMode: boolean;
  hasChanges: boolean;
  changeCount: number;
  saving: boolean;
  saveError: string | null;
  selectedKey: string | null;
  selectedKeyHasOverride: boolean;
  showConfirmDiscard: boolean;
  showConfirmRevert: boolean;
  saveChanges: () => Promise<boolean>;
  discardChanges: () => void;
  handleToggleEditMode: () => void;
  handleShowRevertConfirm: () => void;
  handleCancelDiscard: () => void;
  handleSaveAndExit: () => Promise<void>;
  handleDiscardAndExit: () => void;
  handleCancelRevert: () => void;
  handleConfirmRevert: () => Promise<void>;
}
