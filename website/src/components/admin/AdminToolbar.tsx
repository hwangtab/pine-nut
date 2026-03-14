"use client";

import { useAdminEdit } from "@/lib/contexts/AdminEditContext";
import { useState, useEffect, useRef, useCallback } from "react";

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
    selectedKey,
    hasOverride,
    revertKey,
  } = useAdminEdit();

  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);
  const [showConfirmRevert, setShowConfirmRevert] = useState(false);
  const discardDialogRef = useRef<HTMLDivElement>(null);
  const revertDialogRef = useRef<HTMLDivElement>(null);

  // Escape key handler for discard dialog
  useEffect(() => {
    if (!showConfirmDiscard) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirmDiscard(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showConfirmDiscard]);

  // Escape key handler for revert dialog
  useEffect(() => {
    if (!showConfirmRevert) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirmRevert(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showConfirmRevert]);

  // Focus trap for dialogs
  const trapFocus = useCallback((e: React.KeyboardEvent, ref: React.RefObject<HTMLDivElement | null>) => {
    if (e.key !== "Tab" || !ref.current) return;
    const focusable = ref.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }, []);

  if (!isAdmin) return null;

  return (
    <>
      {/* Main toolbar */}
      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9990] flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 bg-gray-900/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10 max-w-[calc(100vw-2rem)]"
        data-admin-toolbar
      >
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
            {!hasChanges && (
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
              <>
                <div className="w-px h-6 bg-white/20" />
                <span
                  className="hidden md:block max-w-[220px] truncate text-xs text-white/60 font-mono"
                  title={selectedKey}
                >
                  {selectedKey}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!hasOverride(selectedKey) || saving) return;
                    setShowConfirmRevert(true);
                  }}
                  disabled={!hasOverride(selectedKey) || saving}
                  className="px-3 py-2 rounded-xl text-sm font-semibold bg-amber-500/90 hover:bg-amber-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  기본값 복원
                </button>
              </>
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

        {/* Admin link */}
        <div className="w-px h-6 bg-white/20" />
        <a
          href="/admin"
          className="px-3 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-colors"
        >
          관리자
        </a>
      </div>

      {isEditMode && !saveError && (
        <div className="fixed bottom-24 left-1/2 z-[9989] w-[min(92vw,38rem)] -translate-x-1/2 rounded-2xl border border-white/10 bg-gray-900/90 px-4 py-3 text-xs text-white/70 shadow-2xl backdrop-blur-xl">
          인라인 편집은 문구, 이미지, 링크, 섹션 표시 여부를 다룹니다. 내비/푸터 링크 세트, 기존 섹션 순서, 커스텀 섹션은 <strong className="text-white/90">사이트 빌더</strong>, 이전 상태 복원은 <strong className="text-white/90">히스토리</strong>에서 관리합니다.
        </div>
      )}

      {/* Save error toast */}
      {saveError && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9991] w-[min(92vw,24rem)] px-5 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl shadow-2xl text-center">
          {saveError}
        </div>
      )}

      {/* Discard confirmation */}
      {showConfirmDiscard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmDiscard(false);
          }}
        >
          <div
            ref={discardDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="discard-dialog-title"
            aria-describedby="discard-dialog-desc"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onKeyDown={(e) => trapFocus(e, discardDialogRef)}
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
                onClick={() => setShowConfirmDiscard(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                계속 편집
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  const didSave = await saveChanges();
                  if (didSave) {
                    setTimeout(() => {
                      setShowConfirmDiscard(false);
                      toggleEditMode();
                    }, 100);
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

      {/* Revert confirmation */}
      {showConfirmRevert && selectedKey && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirmRevert(false);
          }}
        >
          <div
            ref={revertDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="revert-dialog-title"
            aria-describedby="revert-dialog-desc"
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onKeyDown={(e) => trapFocus(e, revertDialogRef)}
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
                onClick={() => setShowConfirmRevert(false)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  await revertKey(selectedKey);
                  setShowConfirmRevert(false);
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {saving ? "복원 중..." : "복원"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
