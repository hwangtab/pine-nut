import Link from "next/link";
import { getBoardPosts } from "@/lib/data/board";
import { getMyMemberProfile } from "@/lib/data/member";
import { BOARD_CATEGORIES } from "@/lib/board-categories";

const PER_PAGE = 20;

type SearchParams = Promise<{ page?: string; category?: string; q?: string }>;

export default async function BoardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const parsedPage = Number.parseInt(sp.page ?? "1", 10);
  const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
  const category = sp.category ?? "";
  const q = sp.q ?? "";

  const [{ items, total }, profile] = await Promise.all([
    getBoardPosts(page, { category, q }, PER_PAGE),
    getMyMemberProfile(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildHref(params: { page?: number; category?: string; q?: string }) {
    const usp = new URLSearchParams();
    if (params.page && params.page > 1) usp.set("page", String(params.page));
    if (params.category) usp.set("category", params.category);
    if (params.q) usp.set("q", params.q);
    const qs = usp.toString();
    return qs ? `/board?${qs}` : "/board";
  }

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

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href={buildHref({ q })}
          className={
            category === ""
              ? "rounded-full bg-[var(--color-forest)] px-4 py-1.5 text-sm font-semibold text-white"
              : "rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
          }
        >
          전체
        </Link>
        {BOARD_CATEGORIES.map((c) => (
          <Link
            key={c}
            href={buildHref({ category: c, q })}
            className={
              category === c
                ? "rounded-full bg-[var(--color-forest)] px-4 py-1.5 text-sm font-semibold text-white"
                : "rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)]"
            }
          >
            {c}
          </Link>
        ))}
      </div>

      <form method="get" action="/board" className="mb-6 flex gap-2">
        <input type="hidden" name="category" value={category} />
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="검색..."
          className="flex-1 rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-forest)]"
        />
        <button
          type="submit"
          className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          검색
        </button>
      </form>

      {items.length === 0 ? (
        <p className="py-20 text-center text-[var(--color-text-muted)]">
          {q ? "검색 결과가 없습니다." : "글이 없습니다."}
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
                <span className="rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs font-medium text-[var(--color-forest)]">
                  {item.category}
                </span>
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
              href={buildHref({ page: page - 1, category, q })}
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
              href={buildHref({ page: page + 1, category, q })}
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
