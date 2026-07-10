"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  resolveReports,
  setPostHidden,
  setCommentHidden,
} from "@/lib/actions/board";
import type { ReportGroup } from "@/lib/data/board-reports";

function ReportCard({ group }: { group: ReportGroup }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(fn: () => Promise<{ error: string } | null>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  const isPost = group.targetType === "post";

  return (
    <li className="rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] px-4 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[var(--color-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-forest)]">
          {isPost ? "글" : "댓글"}
        </span>
        <span className="rounded-full bg-[var(--color-warm)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-warm)]">
          신고 {group.reportCount}
        </span>
        {group.hasPending ? (
          <span className="rounded-full bg-[var(--color-danger-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-danger)]">
            미해결
          </span>
        ) : (
          <span className="rounded-full bg-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-admin-muted)]">
            처리됨
          </span>
        )}
        <span className="text-xs text-[var(--color-admin-muted)]">
          {new Date(group.latestAt).toLocaleString("ko-KR")}
        </span>
      </div>

      <p className="mt-2 text-base font-medium text-[var(--color-admin-text)]">
        {isPost ? group.snippet || "(제목 없음)" : `“${group.snippet}”`}
      </p>
      <p className="mt-1 text-sm text-[var(--color-admin-muted)]">
        사유: {group.reasons.join(", ")}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/board/${group.postId}`}
          target="_blank"
          className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)]"
        >
          내용 보기
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            run(() =>
              isPost
                ? setPostHidden(group.targetId, true)
                : setCommentHidden(group.targetId, group.postId, true),
            )
          }
          className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
        >
          숨김 처리
        </button>
        {group.hasPending && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => resolveReports(group.targetType, group.targetId, "resolved"))}
              className="rounded-lg bg-[var(--color-forest)] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-50"
            >
              해결
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => resolveReports(group.targetType, group.targetId, "dismissed"))}
              className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-muted)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
            >
              무시
            </button>
          </>
        )}
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    </li>
  );
}

export default function ReportsManager({ groups }: { groups: ReportGroup[] }) {
  if (groups.length === 0) {
    return <p className="text-sm text-[var(--color-admin-muted)]">신고가 없습니다.</p>;
  }
  return (
    <ul className="space-y-3">
      {groups.map((g) => (
        <ReportCard key={`${g.targetType}:${g.targetId}`} group={g} />
      ))}
    </ul>
  );
}
