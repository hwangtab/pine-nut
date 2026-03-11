"use client";

import Link from "next/link";
import { deleteTimelineAction, restoreTimelineAction } from "@/lib/actions/timeline";

export default function TimelineListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  async function handleDelete() {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await deleteTimelineAction(id);
  }

  async function handleRestore() {
    await restoreTimelineAction(id);
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
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
          className="px-4 py-2.5 text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          복원
        </button>
      ) : (
        <button
          onClick={handleDelete}
          className="px-4 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          삭제
        </button>
      )}
    </div>
  );
}
