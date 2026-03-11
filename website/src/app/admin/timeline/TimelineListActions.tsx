"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteTimelineAction, restoreTimelineAction } from "@/lib/actions/timeline";

export default function TimelineListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
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
            className="px-4 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
          >
            수정
          </Link>
        )}
        {isDeleted ? (
          <button
            onClick={handleRestore}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "복원"}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "삭제"}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
