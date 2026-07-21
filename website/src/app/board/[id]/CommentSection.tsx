"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createBoardComment,
  deleteBoardComment,
  setCommentHidden,
} from "@/lib/actions/board";
import type { BoardComment } from "@/lib/data/board";
import ReportButton from "./ReportButton";

interface CommentSectionProps {
  postId: number;
  comments: BoardComment[];
  meUserId: string | null;
  canWrite: boolean;
  hasNickname: boolean;
  isEditor: boolean;
}

function SubmitCommentButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "등록 중..." : "댓글 등록"}
    </button>
  );
}

function CommentItem({
  comment,
  postId,
  meUserId,
  isEditor,
  canWrite,
  onMutated,
}: {
  comment: BoardComment;
  postId: number;
  meUserId: string | null;
  isEditor: boolean;
  canWrite: boolean;
  onMutated: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isHiddenOrDeleted = comment.isHidden || comment.isDeleted;

  function handleDelete() {
    if (!confirm("이 댓글을 삭제할까요?")) return;
    startTransition(async () => {
      const res = await deleteBoardComment(comment.id, postId);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onMutated();
    });
  }

  function handleToggleHidden() {
    startTransition(async () => {
      const res = await setCommentHidden(comment.id, postId, !comment.isHidden);
      if (res?.error) {
        setError(res.error);
        return;
      }
      onMutated();
    });
  }

  return (
    <li
      className={`rounded-[var(--radius-card)] border border-[var(--color-border)] shadow-card px-4 py-3 ${
        isHiddenOrDeleted ? "bg-[var(--color-bg)]" : "bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-text-muted)]">
        <span>{comment.authorNickname}</span>
        <span>·</span>
        <span>{new Date(comment.createdAt).toLocaleDateString("ko-KR")}</span>
        {isHiddenOrDeleted && (
          <span className="rounded-full bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
            {comment.isDeleted ? "삭제됨" : "숨김"}
          </span>
        )}
      </div>
      <p
        className={`mt-1 whitespace-pre-line text-base ${
          isHiddenOrDeleted
            ? "text-[var(--color-text-muted)]"
            : "text-[var(--color-text)]"
        }`}
      >
        {comment.content}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {error && (
          <span className="text-xs text-[var(--color-danger)]">{error}</span>
        )}
        {meUserId === comment.authorUserId && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="rounded-full bg-[var(--color-danger-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--color-danger)] transition-colors hover:opacity-80 disabled:opacity-50"
          >
            삭제
          </button>
        )}
        {isEditor && (
          <button
            type="button"
            onClick={handleToggleHidden}
            disabled={pending}
            className="rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg)] disabled:opacity-50"
          >
            {comment.isHidden ? "숨김 해제" : "숨김"}
          </button>
        )}
        {!isHiddenOrDeleted && meUserId !== comment.authorUserId && (
          <ReportButton targetType="comment" targetId={comment.id} canReport={canWrite} />
        )}
      </div>
    </li>
  );
}

export default function CommentSection({
  postId,
  comments,
  meUserId,
  canWrite,
  hasNickname,
  isEditor,
}: CommentSectionProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    createBoardComment.bind(null, postId),
    null
  );

  function handleMutated() {
    router.refresh();
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[var(--color-text)]">
        댓글 {comments.length}
      </h2>

      {comments.length > 0 && (
        <ul className="mt-4 space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              postId={postId}
              meUserId={meUserId}
              isEditor={isEditor}
              canWrite={canWrite}
              onMutated={handleMutated}
            />
          ))}
        </ul>
      )}

      <div className="mt-6">
        {canWrite && hasNickname && (
          <form action={formAction} className="space-y-3">
            {state?.error && (
              <div className="rounded-[var(--radius-card)] border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-sm font-medium text-[var(--color-danger)]">
                {state.error}
              </div>
            )}
            <textarea
              name="content"
              required
              rows={3}
              placeholder="댓글을 입력하세요"
              className="w-full resize-y rounded-xl border border-[var(--color-border)] px-4 py-3 text-base outline-none focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/30"
            />
            <SubmitCommentButton />
          </form>
        )}

        {canWrite && !hasNickname && (
          <p className="text-sm text-[var(--color-text-muted)]">
            댓글을 쓰려면 닉네임을 설정하세요.{" "}
            <Link
              href="/mypage"
              className="font-semibold text-[var(--color-forest)] hover:underline"
            >
              마이페이지
            </Link>
          </p>
        )}

        {!canWrite && (
          <p className="text-sm text-[var(--color-text-muted)]">
            댓글은 로그인한 회원만 쓸 수 있습니다.{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--color-forest)] hover:underline"
            >
              로그인
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
