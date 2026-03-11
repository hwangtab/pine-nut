import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Newspaper, Clock, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return redirect("/admin/login");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/admin/login");

  // Fetch counts
  const { count: newsCount } = await supabase
    .from("news")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: timelineCount } = await supabase
    .from("timeline_events")
    .select("*", { count: "exact", head: true })
    .eq("is_deleted", false);

  const { count: signatureCount } = await supabase
    .from("signatures")
    .select("*", { count: "exact", head: true });

  const cards = [
    {
      href: "/admin/signatures",
      label: "총 서명 수",
      value: (signatureCount ?? 0).toLocaleString("ko-KR"),
      suffix: "명",
      icon: Users,
      color: "bg-orange-50 text-orange-700",
    },
    {
      href: "/admin/news",
      label: "게시된 소식",
      value: (newsCount ?? 0).toString(),
      suffix: "건",
      icon: Newspaper,
      color: "bg-green-50 text-green-700",
    },
    {
      href: "/admin/timeline",
      label: "타임라인 이벤트",
      value: (timelineCount ?? 0).toString(),
      suffix: "건",
      icon: Clock,
      color: "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">관리자 대시보드</h1>
      <p className="text-gray-500 mb-8">풍천리 웹사이트를 관리합니다</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="text-sm text-gray-500 mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-gray-800">
              {card.value}
              <span className="text-lg font-normal text-gray-400 ml-1">{card.suffix}</span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-gray-700 mb-4">빠른 작업</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/news/new"
          className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-gray-800">새 소식 작성</div>
            <div className="text-sm text-gray-500">뉴스, 공지사항을 작성합니다</div>
          </div>
        </Link>
        <Link
          href="/admin/timeline/new"
          className="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-gray-800">타임라인 추가</div>
            <div className="text-sm text-gray-500">새로운 이벤트를 기록합니다</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
