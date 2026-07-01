"use client";

import { AdminEditProvider } from "@/lib/contexts/AdminEditContext";
import AdminToolbar from "@/components/admin/AdminToolbar";
import type { PageContent } from "@/lib/data/page-content";

interface AdminEditShellProps {
  children: React.ReactNode;
  isAdmin: boolean;
  isLoggedIn: boolean;
  initialContent: Record<string, PageContent>;
}

/**
 * Client wrapper that provides the admin edit context
 * and the floating toolbar to all public pages.
 */
export default function AdminEditShell({
  children,
  isAdmin,
  isLoggedIn,
  initialContent,
}: AdminEditShellProps) {
  return (
    <AdminEditProvider
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      initialContent={initialContent}
    >
      {children}
      <AdminToolbar />
    </AdminEditProvider>
  );
}
