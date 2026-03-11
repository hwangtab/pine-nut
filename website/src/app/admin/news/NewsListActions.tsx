"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteNewsAction, restoreNewsAction } from "@/lib/actions/news";

export default function NewsListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm("이 소식을 삭제하시겠습니까?\n(나중에 복원할 수 있습니다)")) return;
    setLoading(true);
    setError(null);
    const result = await deleteNewsAction(id);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  async function handleRestore() {
    setLoading(true);
    setError(null);
    const result = await restoreNewsAction(id);
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
            href={`/admin/news/${id}/edit`}
            className="px-5 py-3 text-base font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            수정
          </Link>
        )}
        {isDeleted ? (
          <button
            onClick={handleRestore}
            disabled={loading}
            className="px-5 py-3 text-base font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "복원"}
          </button>
        ) : (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-5 py-3 text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "처리 중..." : "삭제"}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
