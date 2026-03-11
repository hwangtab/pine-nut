import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { createNewsAction } from "@/lib/actions/news";
import NewsForm from "@/components/admin/NewsForm";

export default async function AdminNewsNewPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <Link href="/admin/news" className="text-base text-gray-600 font-medium hover:text-gray-700 mb-4 inline-block">
        ← 소식 목록으로
      </Link>
      <h1 className="text-2xl font-bold text-gray-800 mb-8">새 소식 작성</h1>
      <NewsForm action={createNewsAction} submitLabel="게시하기" />
    </div>
  );
}
