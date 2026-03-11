import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getAllTimeline } from "@/lib/data/timeline";
import TimelineListActions from "./TimelineListActions";

const PER_PAGE = 20;

type SearchParams = Promise<{ page?: string; q?: string }>;

export default async function AdminTimelinePage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const query = params.q ?? "";
  const { items: allTimeline, total } = await getAllTimeline({ page, perPage: PER_PAGE, query });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">타임라인 관리</h1>
        <Link
          href="/admin/timeline/new"
          className="px-6 py-3 bg-blue-700 text-white font-bold rounded-xl hover:bg-blue-800 transition-colors text-base"
        >
          + 새 이벤트
        </Link>
      </div>

      <form method="get" className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            type="text"
            defaultValue={query}
            placeholder="제목으로 검색..."
            className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            검색
          </button>
        </div>
      </form>

      {allTimeline.length === 0 ? (
        <p className="text-gray-500 text-center py-20">
          {query ? `"${query}" 검색 결과가 없습니다.` : "등록된 타임라인 이벤트가 없습니다."}
        </p>
      ) : (
        <>
          <p className="text-base text-gray-600 mb-4">총 {total}건</p>
          <div className="space-y-3">
            {allTimeline.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4 ${
                  item.isDeleted ? "opacity-50" : ""
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    {item.isDeleted && (
                      <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                        삭제됨
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-800">{item.title}</h3>
                  <p className="text-base text-gray-600">
                    {item.date} · {item.year}년
                  </p>
                </div>

                <TimelineListActions id={item.id} isDeleted={item.isDeleted} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              {page > 1 && (
                <Link
                  href={`/admin/timeline?page=${page - 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  ← 이전
                </Link>
              )}
              <span className="text-base text-gray-600">{page} / {totalPages}</span>
              {page < totalPages && (
                <Link
                  href={`/admin/timeline?page=${page + 1}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  다음 →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
