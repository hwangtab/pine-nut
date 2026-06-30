import AdminDashboardCards from "@/components/admin/dashboard/AdminDashboardCards";
import AdminDashboardGuide from "@/components/admin/dashboard/AdminDashboardGuide";
import AdminDashboardWarnings from "@/components/admin/dashboard/AdminDashboardWarnings";
import AdminQuickActions from "@/components/admin/dashboard/AdminQuickActions";
import AdminSpecialPagesNotice from "@/components/admin/dashboard/AdminSpecialPagesNotice";
import { getAdminContext } from "@/lib/actions/auth";
import { getAdminDashboardData } from "@/lib/data/admin-dashboard";

export default async function AdminDashboard() {
  await getAdminContext(); // 비-명부/비활성 인증자는 로그인으로 리다이렉트 (viewer 이상 통과)
  const { newsStatus, timelineStatus, signatureStatus, warnings } =
    await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-4xl p-6 md:p-10">
      <h1 className="mb-2 text-2xl font-bold text-[var(--color-admin-text)]">
        관리자 대시보드
      </h1>
      <p className="mb-8 text-[var(--color-admin-muted)]">
        풍천리 웹사이트를 관리합니다
      </p>

      <AdminDashboardWarnings warnings={warnings} />
      <AdminDashboardGuide />
      <AdminDashboardCards
        signatureStatus={signatureStatus}
        newsStatus={newsStatus}
        timelineStatus={timelineStatus}
      />
      <AdminQuickActions />
      <AdminSpecialPagesNotice />
    </div>
  );
}
