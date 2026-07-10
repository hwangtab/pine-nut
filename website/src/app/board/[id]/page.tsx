import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoardPost, hasLikedPost } from "@/lib/data/board";
import { getMyMemberProfile } from "@/lib/data/member";
import { getMyAdminMember } from "@/lib/data/admin-members";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BoardPostActions from "./BoardPostActions";
import CommentSection from "./CommentSection";
import LikeButton from "./LikeButton";
import ReportButton from "./ReportButton";

export default async function BoardPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number.parseInt(idParam, 10);
  if (Number.isNaN(id)) notFound();

  const post = await getBoardPost(id);
  if (!post) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  const meId = user?.id ?? null;

  const [profile, admin, liked] = await Promise.all([
    getMyMemberProfile(),
    getMyAdminMember(),
    hasLikedPost(id),
  ]);
  const canWrite = !!profile;
  const hasNickname = !!profile?.nickname;
  const isEditor = admin?.role === "owner" || admin?.role === "editor";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/board"
        className="text-base text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ← 목록
      </Link>

      {(post.isHidden || post.isDeleted) && (
        <div className="mt-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm font-medium text-[var(--color-text-muted)]">
          이 글은 숨김/삭제되었습니다 (기획단에게만 표시)
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <span className="rounded-full bg-[var(--color-forest)]/10 px-2.5 py-0.5 text-xs font-semibold text-[var(--color-forest)]">
          {post.category}
        </span>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        {post.authorNickname} ·{" "}
        {new Date(post.createdAt).toLocaleDateString("ko-KR")}
      </p>

      <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-[var(--color-text)]">
        {post.content}
      </p>

      {post.images.length > 0 && (
        <div className="mt-6 space-y-3">
          {post.images.map((im) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={im.id} src={im.url} alt="" className="w-full rounded-xl" />
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LikeButton
          postId={id}
          count={post.likeCount}
          liked={liked}
          canLike={canWrite}
        />
        {meId !== post.authorUserId && (
          <ReportButton targetType="post" targetId={id} canReport={canWrite} />
        )}
      </div>

      <div className="mt-6">
        <BoardPostActions
          postId={id}
          isAuthor={meId === post.authorUserId}
          isEditor={isEditor}
          isHidden={post.isHidden}
        />
      </div>

      <div className="mt-10 border-t border-[var(--color-border)] pt-8">
        <CommentSection
          postId={id}
          comments={post.comments}
          meUserId={meId}
          canWrite={canWrite}
          hasNickname={hasNickname}
          isEditor={isEditor}
        />
      </div>
    </div>
  );
}
