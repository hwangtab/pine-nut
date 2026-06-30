import { AdminDialogFrame } from "./AdminDialogFrame";

export function DiscardChangesDialog({
  open,
  changeCount,
  saving,
  onCancel,
  onSaveAndExit,
  onDiscardAndExit,
}: {
  open: boolean;
  changeCount: number;
  saving: boolean;
  onCancel: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
}) {
  return (
    <AdminDialogFrame
      open={open}
      titleId="discard-dialog-title"
      descriptionId="discard-dialog-desc"
      onClose={onCancel}
    >
      <h3 id="discard-dialog-title" className="text-lg font-bold text-gray-900 mb-2">
        편집 모드 종료
      </h3>
      <p id="discard-dialog-desc" className="text-sm text-gray-600 mb-6">
        저장되지 않은 {changeCount}개의 변경사항이 있습니다. 종료하시겠습니까?
      </p>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          계속 편집
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onSaveAndExit}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          저장 후 종료
        </button>
        <button
          type="button"
          onClick={onDiscardAndExit}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          버리기
        </button>
      </div>
    </AdminDialogFrame>
  );
}
