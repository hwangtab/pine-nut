import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllNews } from "@/lib/data/news";
import NewsListActions from "./NewsListActions";

export default async function AdminNewsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const allNews = await getAllNews();

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">소식 관리</h1>
        <Link
          href="/admin/news/new"
          className="px-6 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-colors text-base"
        >
          + 새 소식
        </Link>
      </div>

      {allNews.length === 0 ? (
        <p className="text-gray-500 text-center py-20">등록된 소식이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {allNews.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4 ${
                item.isDeleted ? "opacity-50" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  {item.isDeleted && (
                    <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                      삭제됨
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-gray-800 truncate">{item.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString("ko-KR")}
                  {item.sourceName && ` · ${item.sourceName}`}
                </p>
              </div>

              <NewsListActions id={item.id} isDeleted={item.isDeleted} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
