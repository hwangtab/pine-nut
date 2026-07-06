import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import BoardPostForm from "@/components/board/BoardPostForm";
import { getBoardPost } from "@/lib/data/board";
import { updateBoardPost } from "@/lib/actions/board";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import BoardImageManager from "./BoardImageManager";

export default async function EditBoardPostPage({
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

  if (!user || user.id !== post.authorUserId) {
    redirect(`/board/${id}`);
  }

  const action = updateBoardPost.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={`/board/${id}`}
        className="text-base text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        ← 글로
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold text-[var(--color-text)]">
        글 수정
      </h1>
      <BoardPostForm
        action={action}
        initial={{ title: post.title, content: post.content, category: post.category }}
        submitLabel="수정"
      />
      <BoardImageManager
        postId={id}
        images={post.images.map((i) => ({ id: i.id, url: i.url }))}
      />
    </div>
  );
}
