import Link from "next/link";
import {
  Blocks,
  Clock,
  History,
  Images,
  Newspaper,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AdminDashboardMetricStatus } from "@/lib/data/admin-dashboard";

interface AdminDashboardCardsProps {
  signatureStatus: AdminDashboardMetricStatus;
  newsStatus: AdminDashboardMetricStatus;
  timelineStatus: AdminDashboardMetricStatus;
}

interface AdminDashboardCard {
  href: string;
  label: string;
  value: string;
  suffix: string;
  icon: LucideIcon;
  color: string;
}

export default function AdminDashboardCards({
  signatureStatus,
  newsStatus,
  timelineStatus,
}: AdminDashboardCardsProps) {
  const cards: AdminDashboardCard[] = [
    {
      href: "/admin/site-builder",
      label: "사이트 빌더",
      value: "링크/섹션",
      suffix: "",
      icon: Blocks,
      color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    },
    {
      href: "/admin/media",
      label: "미디어 라이브러리",
      value: "이미지",
      suffix: "",
      icon: Images,
      color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    },
    {
      href: "/admin/history",
      label: "버전 히스토리",
      value: "로그",
      suffix: "",
      icon: History,
      color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    },
    {
      href: "/admin/signatures",
      label: "총 서명 수",
      value: signatureStatus.value,
      suffix: signatureStatus.warning ? "" : "명",
      icon: Users,
      color: "bg-[var(--color-warm)]/10 text-[var(--color-warm)]",
    },
    {
      href: "/admin/news",
      label: "게시된 소식",
      value: newsStatus.value,
      suffix: newsStatus.warning ? "" : "건",
      icon: Newspaper,
      color: "bg-[var(--color-forest)]/10 text-[var(--color-forest)]",
    },
    {
      href: "/admin/timeline",
      label: "타임라인 이벤트",
      value: timelineStatus.value,
      suffix: timelineStatus.warning ? "" : "건",
      icon: Clock,
      color: "bg-[var(--color-sky)]/10 text-[var(--color-sky)]",
    },
  ];

  return (
    <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <Link
          key={card.href}
          href={card.href}
          className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-6 transition-shadow hover:shadow-md"
        >
          <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
            <card.icon size={24} />
          </div>
          <div className="mb-1 text-sm text-[var(--color-admin-muted)]">
            {card.label}
          </div>
          <div className="text-3xl font-bold text-[var(--color-admin-text)]">
            {card.value}
            <span className="ml-1 text-lg font-normal text-[var(--color-admin-muted)]/70">
              {card.suffix}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
