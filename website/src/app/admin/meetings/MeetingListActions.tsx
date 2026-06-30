"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { deleteMeetingAction, restoreMeetingAction } from "@/lib/actions/meetings";

export default function MeetingListActions({ id, isDeleted }: { id: number; isDeleted: boolean }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!confirm("이 회의록을 삭제할까요? (히스토리에서 복원 가능)")) return;
    startTransition(async () => {
      const res = await deleteMeetingAction(id);
      if (res?.error) setError(res.error);
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const res = await restoreMeetingAction(id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      {!isDeleted && (
        <Link href={`/admin/meetings/${id}/edit`} className="px-4 py-2 text-sm font-semibold text-[var(--color-sky)] bg-[var(--color-sky)]/10 rounded-lg hover:bg-[var(--color-sky)]/20 transition-colors">
          편집
        </Link>
      )}
      {isDeleted ? (
        <button onClick={handleRestore} disabled={pending} className="px-4 py-2 text-sm font-semibold text-[var(--color-forest)] bg-[var(--color-forest)]/10 rounded-lg hover:bg-[var(--color-forest)]/20 transition-colors disabled:opacity-50">복원</button>
      ) : (
        <button onClick={handleDelete} disabled={pending} className="px-4 py-2 text-sm font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg hover:opacity-80 transition-colors disabled:opacity-50">삭제</button>
      )}
    </div>
  );
}
