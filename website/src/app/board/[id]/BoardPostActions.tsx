"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteBoardPost, setPostHidden } from "@/lib/actions/board";

interface BoardPostActionsProps {
  postId: number;
  isAuthor: boolean;
  isEditor: boolean;
  isHidden: boolean;
}

export default function BoardPostActions({
  postId,
  isAuthor,
  isEditor,
  isHidden,
}: BoardPostActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isAuthor && !isEditor) return null;

  function handleDelete() {
    if (!confirm("이 글을 삭제할까요?")) return;
    startTransition(async () => {
      const res = await deleteBoardPost(postId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.push("/board");
    });
  }

  function handleToggleHidden() {
    startTransition(async () => {
      const res = await setPostHidden(postId, !isHidden);
      if (res?.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && (
        <span className="text-sm text-[var(--color-danger)]">{error}</span>
      )}
      {isAuthor && (
        <>
          <Link
            href={`/board/${postId}/edit`}
            className="rounded-lg bg-[var(--color-sky)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-sky)] transition-colors hover:bg-[var(--color-sky)]/20"
          >
            수정
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-lg bg-[var(--color-danger-bg)] px-4 py-2 text-sm font-semibold text-[var(--color-danger)] transition-colors hover:opacity-80 disabled:opacity-50"
          >
            삭제
          </button>
        </>
      )}
      {isEditor && (
        <button
          type="button"
          onClick={handleToggleHidden}
          disabled={pending}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
        >
          {isHidden ? "숨김 해제" : "숨김"}
        </button>
      )}
    </div>
  );
}
