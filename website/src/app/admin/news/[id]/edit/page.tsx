import { notFound } from "next/navigation";
import Link from "next/link";
import { getNewsById } from "@/lib/data/news";
import { updateNewsAction } from "@/lib/actions/news";
import NewsForm from "@/components/admin/NewsForm";

type Params = Promise<{ id: string }>;

export default async function AdminNewsEditPage({ params }: { params: Params }) {
  const { id } = await params;
  const newsId = parseInt(id, 10);
  const newsItem = await getNewsById(newsId);

  if (!newsItem) notFound();

  const boundAction = updateNewsAction.bind(null, newsId);

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/news" className="min-h-[44px] inline-flex items-center text-base text-[var(--color-admin-muted)] font-medium hover:text-[var(--color-admin-text)] mb-4">
        ← 소식 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-8 break-words">소식 수정: {newsItem.title}</h1>
      <NewsForm action={boundAction} initialData={newsItem} submitLabel="저장하기" />
    </div>
  );
}
