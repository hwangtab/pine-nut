import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "관리자 — 풍천리를 지켜주세요",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    // Allow unauthenticated access only to login page
    // The login page itself handles redirection
    if (!user) {
      // We can't check the path here easily in a layout,
      // so the login page will be accessible and other pages
      // will redirect from their own logic.
      // Instead, we use a simple approach: render children
      // and let each page check auth.
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50" style={{ fontSize: "18px" }}>
      <AdminSidebar />
      <div className="flex-1 pb-20 md:pb-0">
        {children}
      </div>
    </div>
  );
}
