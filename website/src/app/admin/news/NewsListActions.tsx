"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteNewsAction, restoreNewsAction } from "@/lib/actions/news";
import ConfirmModal from "@/components/admin/ConfirmModal";

export default function NewsListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function doDelete() {
    setShowConfirm(false);
    setLoading(true);
    setError(null);
    try {
      const result = await deleteNewsAction(id);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    setError(null);
    try {
      const result = await restoreNewsAction(id);
      if (result?.error) {
        setError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full shrink-0 flex-col gap-1 sm:w-auto sm:items-end">
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        {!isDeleted && (
          <Link
            href={`/admin/news/${id}/edit`}
            className="min-h-[44px] rounded-lg bg-[var(--color-forest)]/10 px-5 py-3 text-base font-bold text-[var(--color-forest)] transition-colors hover:bg-[var(--color-forest)]/20"
          >
            수정
          </Link>
        )}
        {isDeleted ? (
          <button
            onClick={handleRestore}
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-[var(--color-sky)]/10 px-5 py-3 text-base font-bold text-[var(--color-sky)] transition-colors hover:bg-[var(--color-sky)]/20 disabled:opacity-50"
          >
            {loading ? "처리 중..." : "복원"}
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="min-h-[44px] rounded-lg bg-[var(--color-danger-bg)] px-5 py-3 text-base font-bold text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger-border)] disabled:opacity-50"
          >
            {loading ? "처리 중..." : "삭제"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] font-medium">{error}</p>}
      <ConfirmModal
        open={showConfirm}
        title="소식 삭제"
        message="이 소식을 삭제하시겠습니까?\n나중에 복원할 수 있습니다."
        confirmLabel="삭제"
        onConfirm={doDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
