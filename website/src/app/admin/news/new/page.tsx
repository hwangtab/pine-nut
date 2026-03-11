import Link from "next/link";
import { createNewsAction } from "@/lib/actions/news";
import NewsForm from "@/components/admin/NewsForm";

export default async function AdminNewsNewPage() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/news" className="min-h-[44px] inline-flex items-center text-base text-[var(--color-admin-muted)] font-medium hover:text-[var(--color-admin-text)] mb-4">
        ← 소식 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-8">새 소식 작성</h1>
      <NewsForm action={createNewsAction} submitLabel="게시하기" />
    </div>
  );
}
