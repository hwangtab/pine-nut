"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTimelineAction, restoreTimelineAction } from "@/lib/actions/timeline";

export default function TimelineListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("이 타임라인을 삭제하시겠습니까?\n(나중에 복원할 수 있습니다)")) return;
    setLoading(true);
    setError(null);
    const result = await deleteTimelineAction(id);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    setError(null);
    const result = await restoreTimelineAction(id);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-2">
        {!isDeleted && (
          <Link
            href={`/admin/timeline/${id}/edit`}
            className="min-h-[44px] px-5 py-3 text-base font-bold text-[var(--color-sky)] bg-[var(--color-sky)]/10 hover:bg-[var(--color-sky)]/20 rounded-lg transition-colors"
          >
            수정
          </Link>
        )}
        {isDeleted ? (
          <button
            onClick={handleRestore}
            disabled={loading}
            className="min-h-[44px] px-5 py-3 text-base font-bold text-[var(--color-sky)] bg-[var(--color-sky)]/10 hover:bg-[var(--color-sky)]/20 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "복원"}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="min-h-[44px] px-5 py-3 text-base font-bold text-[var(--color-danger)] bg-[var(--color-danger-bg)] hover:bg-[var(--color-danger-border)] rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "삭제"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-[var(--color-danger)] font-medium">{error}</p>}
    </div>
  );
}
