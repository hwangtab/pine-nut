import Link from "next/link";
import { Blocks, Images, Plus } from "lucide-react";

const QUICK_ACTIONS = [
  {
    href: "/admin/site-builder",
    label: "사이트 빌더",
    description: "링크와 커스텀 섹션을 관리합니다",
    icon: Blocks,
    color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  },
  {
    href: "/admin/news/new",
    label: "새 소식 작성",
    description: "뉴스, 공지사항을 작성합니다",
    icon: Plus,
    color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
  },
  {
    href: "/admin/timeline/new",
    label: "타임라인 추가",
    description: "새로운 이벤트를 기록합니다",
    icon: Plus,
    color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
  },
  {
    href: "/admin/media",
    label: "미디어 라이브러리",
    description: "업로드한 이미지를 재사용합니다",
    icon: Images,
    color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
  },
];

export default function AdminQuickActions() {
  return (
    <>
      <h2 className="mb-4 text-lg font-bold text-[var(--color-admin-text)]">빠른 작업</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-4 rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-5 transition-shadow hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.color}`}>
              <action.icon size={24} />
            </div>
            <div>
              <div className="font-bold text-[var(--color-admin-text)]">
                {action.label}
              </div>
              <div className="text-sm text-[var(--color-admin-muted)]">
                {action.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
