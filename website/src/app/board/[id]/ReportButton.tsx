"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reportTarget } from "@/lib/actions/board";

const REASONS = ["스팸/광고", "욕설/비방", "부적절한 내용", "기타"];

interface ReportButtonProps {
  targetType: "post" | "comment";
  targetId: number;
  canReport: boolean;
}

export default function ReportButton({ targetType, targetId, canReport }: ReportButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (done) {
    return <span className="text-xs text-[var(--color-text-muted)]">신고되었습니다</span>;
  }

  function handleToggle() {
    if (!canReport) {
      router.push("/login");
      return;
    }
    setError(null);
    setOpen((v) => !v);
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await reportTarget(targetType, targetId, reason);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      setDone(true);
    });
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg)]"
      >
        신고
      </button>
      {open && (
        <>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-lg border border-[var(--color-border)] px-2 py-1.5 text-xs outline-none focus:border-[var(--color-forest)]"
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={pending}
            className="rounded-lg bg-[var(--color-warm)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "제출 중..." : "제출"}
          </button>
        </>
      )}
      {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
    </span>
  );
}
