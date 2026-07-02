import Link from "next/link";
import { getBoardPosts } from "@/lib/data/board";
import { getMyMemberProfile } from "@/lib/data/member";

const PER_PAGE = 20;

export default async function BoardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const parsedPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

  const [{ items, total }, profile] = await Promise.all([
    getBoardPosts(page, PER_PAGE),
    getMyMemberProfile(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">게시판</h1>
        {profile && (
          <Link
            href="/board/new"
            className="rounded-xl bg-[var(--color-forest)] px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-[var(--color-forest-light)]"
          >
            글쓰기
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-20 text-center text-[var(--color-text-muted)]">
          아직 글이 없습니다.
        </p>
      ) : (
        <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/board/${item.id}`}
              className="block px-5 py-4 transition-colors hover:bg-[var(--color-bg)]"
            >
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-[var(--color-text)]">
                  {item.title}
                </h2>
                {(item.isHidden || item.isDeleted) && (
                  <span className="rounded bg-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-text-muted)]">
                    {item.isDeleted ? "삭제됨" : "숨김"}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                {item.authorNickname} ·{" "}
                {new Date(item.createdAt).toLocaleDateString("ko-KR")} · 댓글{" "}
                {item.commentCount}
              </p>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          {page > 1 ? (
            <Link
              href={`/board?page=${page - 1}`}
              className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              이전
            </Link>
          ) : (
            <span className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] opacity-50">
              이전
            </span>
          )}
          <span className="text-sm text-[var(--color-text-muted)]">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/board?page=${page + 1}`}
              className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              다음
            </Link>
          ) : (
            <span className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] opacity-50">
              다음
            </span>
          )}
        </div>
      )}
    </div>
  );
}
