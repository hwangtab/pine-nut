import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Newspaper, Clock, Users } from "lucide-react";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for admin dashboard.");
  }

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
      color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    },
    {
      href: "/admin/news",
      label: "게시된 소식",
      value: (newsCount ?? 0).toString(),
      suffix: "건",
      icon: Newspaper,
      color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    },
    {
      href: "/admin/timeline",
      label: "타임라인 이벤트",
      value: (timelineCount ?? 0).toString(),
      suffix: "건",
      icon: Clock,
      color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">관리자 대시보드</h1>
      <p className="text-[var(--color-admin-muted)] mb-8">풍천리 웹사이트를 관리합니다</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-6 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div className="text-sm text-[var(--color-admin-muted)] mb-1">{card.label}</div>
            <div className="text-3xl font-bold text-[var(--color-admin-text)]">
              {card.value}
              <span className="text-lg font-normal text-[var(--color-admin-muted)]/70 ml-1">{card.suffix}</span>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-bold text-[var(--color-admin-text)] mb-4">빠른 작업</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/news/new"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-forest)]/10 flex items-center justify-center text-[var(--color-forest)] text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">새 소식 작성</div>
            <div className="text-sm text-[var(--color-admin-muted)]">뉴스, 공지사항을 작성합니다</div>
          </div>
        </Link>
        <Link
          href="/admin/timeline/new"
          className="flex items-center gap-4 bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-5 hover:shadow-md transition-shadow"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--color-sky)]/10 flex items-center justify-center text-[var(--color-sky)] text-2xl font-bold">
            +
          </div>
          <div>
            <div className="font-bold text-[var(--color-admin-text)]">타임라인 추가</div>
            <div className="text-sm text-[var(--color-admin-muted)]">새로운 이벤트를 기록합니다</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
