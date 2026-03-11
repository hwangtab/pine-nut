"use client";

import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { useState } from "react";

export default function AdminToolbar() {
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
  } = useAdminEdit();

  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  if (!isAdmin) return null;

  return (
    <>
      {/* Main toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-3 px-5 py-3 bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10">
        {/* Edit mode toggle */}
        <button
          type="button"
          onClick={() => {
            if (isEditMode && hasChanges) {
              setShowConfirmDiscard(true);
            } else {
              toggleEditMode();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            isEditMode
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          {isEditMode ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              편집 중
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              편집 모드
            </>
          )}
        </button>

        {/* Change counter & actions */}
        {isEditMode && (
          <>
            <div className="w-px h-6 bg-white/20" />

            {hasChanges && (
              <span className="text-xs text-blue-300 font-medium">
                {changeCount}개 변경
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
          </>
        )}

        {/* Admin link */}
        <div className="w-px h-6 bg-white/20" />
        <a
          href="/admin"
          className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
        >
          관리자
        </a>
      </div>

      {/* Save error toast */}
      {saveError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9991] px-5 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl shadow-2xl">
          {saveError}
        </div>
      )}

      {/* Discard confirmation */}
      {showConfirmDiscard && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              편집 모드 종료
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              저장되지 않은 {changeCount}개의 변경사항이 있습니다. 종료하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmDiscard(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                계속 편집
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  try {
                    await saveChanges();
                    // Give transition time to complete
                    setTimeout(() => {
                      setShowConfirmDiscard(false);
                      toggleEditMode();
                    }, 100);
                  } catch {
                    // Error will be shown via saveError state
                  }
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                저장 후 종료
              </button>
              <button
                type="button"
                onClick={() => {
                  discardChanges();
                  setShowConfirmDiscard(false);
                  // toggleEditMode will now succeed since changes are cleared
                  toggleEditMode();
                }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                버리기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
