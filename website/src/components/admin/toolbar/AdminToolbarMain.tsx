import { Pencil } from "lucide-react";
import type { AdminToolbarState } from "./types";

type AdminToolbarMainProps = Pick<
  AdminToolbarState,
  | "isEditMode"
  | "hasChanges"
  | "changeCount"
  | "saving"
  | "selectedKey"
  | "selectedKeyHasOverride"
  | "saveChanges"
  | "discardChanges"
  | "handleToggleEditMode"
  | "handleShowRevertConfirm"
>;

export function AdminToolbarMain({
  isEditMode,
  hasChanges,
  changeCount,
  saving,
  selectedKey,
  selectedKeyHasOverride,
  saveChanges,
  discardChanges,
  handleToggleEditMode,
  handleShowRevertConfirm,
}: AdminToolbarMainProps) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10 max-w-[calc(100vw-2rem)]"
      data-admin-toolbar
    >
      <button
        type="button"
        onClick={handleToggleEditMode}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
          isEditMode ? "bg-blue-600 hover:bg-blue-700" : "bg-white/10 hover:bg-white/20"
        }`}
      >
        <Pencil className="w-4 h-4" aria-hidden="true" />
        {isEditMode ? "편집 중" : "편집 모드"}
      </button>

      {isEditMode && (
        <>
          <div className="w-px h-6 bg-white/20" />

          {hasChanges ? (
            <span className="text-xs text-blue-300 font-medium">
              {changeCount}개 변경
            </span>
          ) : (
            <span className="hidden lg:block text-xs text-white/55">
              요소를 클릭해 선택하고 저장하세요
            </span>
          )}

          <button
            type="button"
            onClick={discardChanges}
            disabled={!hasChanges || saving}
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            되돌리기
          </button>

          <button
            type="button"
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? "저장 중..." : "저장"}
          </button>

          {selectedKey && (
            <div className="hidden md:contents">
              <div className="w-px h-6 bg-white/20" />
              <span
                className="max-w-[220px] truncate text-xs text-white/60 font-mono"
                title={selectedKey}
              >
                {selectedKey}
              </span>
              <button
                type="button"
                onClick={handleShowRevertConfirm}
                disabled={!selectedKeyHasOverride || saving}
                className="px-3 py-2 rounded-xl text-sm font-semibold bg-amber-500/90 hover:bg-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                기본값 복원
              </button>
            </div>
          )}

          <div className="hidden xl:flex items-center gap-2">
            <a
              href="/admin/site-builder"
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
            >
              사이트 빌더
            </a>
            <a
              href="/admin/history"
              className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
            >
              히스토리
            </a>
          </div>
        </>
      )}

      <div className="w-px h-6 bg-white/20" />
      <a
        href="/admin"
        className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
      >
        관리자
      </a>
    </div>
  );
}
