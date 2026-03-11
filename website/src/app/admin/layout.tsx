import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "관리자 — 풍천리를 지켜주세요",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-admin-bg)]" style={{ fontSize: "18px" }}>
      <AdminSidebar />
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
