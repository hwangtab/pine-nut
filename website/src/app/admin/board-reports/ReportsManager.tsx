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

  // 여러 액션을 순서대로 실행하고, 하나라도 실패하면 거기서 멈춘다.
  function run(...fns: (() => Promise<{ error: string } | null>)[]) {
    setError(null);
    startTransition(async () => {
      for (const fn of fns) {
        const res = await fn();
        if (res?.error) {
          setError(res.error);
          router.refresh();
          return;
        }
      }
      router.refresh();
    });
  }

  // 숨김/해제. 숨김은 그 자체로 신고 처리이므로 미해결 신고를 함께 '해결'로 닫는다.
  function setHidden(hidden: boolean) {
    const { targetType, targetId, postId } = group;
    const toggle = () =>
      targetType === "post"
        ? setPostHidden(targetId, hidden)
        : setCommentHidden(targetId, postId ?? 0, hidden);
    if (hidden && group.hasPending) {
      run(toggle, () => resolveReports(targetType, targetId, "resolved"));
    } else {
      run(toggle);
    }
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
        {/* 대상을 찾지 못하면(삭제된 댓글 등) 어느 글로 가야 할지 모른다 → 링크 대신 안내 문구 */}
        {group.postId !== null ? (
          <Link
            href={`/board/${group.postId}`}
            target="_blank"
            className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)]"
          >
            내용 보기
          </Link>
        ) : (
          <span className="text-xs text-[var(--color-admin-muted)]">원문을 찾을 수 없음</span>
        )}
        {group.isHidden === true && (
          <>
            <span className="rounded-full bg-[var(--color-border)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-admin-muted)]">
              숨김 중
            </span>
            <button
              type="button"
              disabled={pending}
              onClick={() => setHidden(false)}
              className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
            >
              숨김 해제
            </button>
          </>
        )}
        {group.isHidden === false && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setHidden(true)}
            className="rounded-lg border border-[var(--color-admin-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-admin-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            숨김 처리
          </button>
        )}
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
