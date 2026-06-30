import { AdminDialogFrame } from "./AdminDialogFrame";

export function RevertKeyDialog({
  open,
  selectedKey,
  saving,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selectedKey: string | null;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!selectedKey) return null;

  return (
    <AdminDialogFrame
      open={open}
      titleId="revert-dialog-title"
      descriptionId="revert-dialog-desc"
      onClose={onCancel}
    >
      <h3 id="revert-dialog-title" className="text-lg font-bold text-gray-900 mb-2">
        기본값으로 복원
      </h3>
      <p id="revert-dialog-desc" className="text-sm text-gray-600 mb-2">
        선택한 요소를 하드코딩 기본값으로 복원하시겠습니까?
      </p>
      <p className="text-xs text-gray-400 font-mono mb-6 truncate" title={selectedKey}>
        {selectedKey}
      </p>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onConfirm}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {saving ? "복원 중..." : "복원"}
        </button>
      </div>
    </AdminDialogFrame>
  );
}
