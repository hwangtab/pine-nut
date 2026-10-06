"use client";

import { useState, useTransition } from "react";
import { deleteCarpoolRiderAction } from "@/lib/actions/carpool";

export default function CarpoolCancelButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (!confirm(`${name}님의 신청을 취소할까요?\n그 자리는 다시 빈자리가 됩니다.`)) return;
    startTransition(async () => {
      const res = await deleteCarpoolRiderAction(id);
      if (res.error) setError(res.error);
    });
  }

  return (
    <span className="flex shrink-0 items-center gap-2">
      {error && <span className="text-sm text-[var(--color-danger)]">{error}</span>}
      <button
        onClick={handleCancel}
        disabled={pending}
        className="rounded-lg bg-[var(--color-danger-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--color-danger)] hover:opacity-80 disabled:opacity-50"
      >
        취소
      </button>
    </span>
  );
}
