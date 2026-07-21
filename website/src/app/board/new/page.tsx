import Link from "next/link";
import BoardPostForm from "@/components/board/BoardPostForm";
import { getMyMemberProfile } from "@/lib/data/member";
import { createBoardPost } from "@/lib/actions/board";

export default async function NewBoardPostPage() {
  const profile = await getMyMemberProfile();

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-card p-10 text-center">
          <p className="mb-4 text-[var(--color-text)]">
            회원만 글을 쓸 수 있습니다.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)]"
          >
            로그인
          </Link>
        </div>
      </div>
    );
  }

  if (!profile.nickname) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white shadow-card p-10 text-center">
          <p className="mb-4 text-[var(--color-text)]">
            먼저 닉네임을 설정해주세요.
          </p>
          <Link
            href="/mypage"
            className="inline-block rounded-full bg-[var(--color-forest)] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)]"
          >
            마이페이지
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/board"
        className="text-base text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ← 목록
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-text)]">
        글쓰기
      </h1>
      <BoardPostForm action={createBoardPost} submitLabel="등록" />
    </div>
  );
}
