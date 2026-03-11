"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, Clock, Users, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/admin", label: "홈", icon: Home },
  { href: "/admin/news", label: "소식 관리", icon: Newspaper },
  { href: "/admin/timeline", label: "타임라인 관리", icon: Clock },
  { href: "/admin/signatures", label: "서명 현황", icon: Users },
];

const SESSION_CHECK_INTERVAL = 60 * 60 * 1000; // 1시간마다 체크

export default function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/admin/login";
  }, []);

  // 세션 만료 자동 체크
  useEffect(() => {
    if (pathname === "/admin/login") return;

    const checkSession = async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/admin/login";
      }
    };

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen p-6">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold text-gray-800">
            풍천리 관리자
          </Link>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-800"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-gray-500 hover:bg-gray-50 transition-colors mt-4"
        >
          <LogOut size={22} />
          로그아웃
        </button>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                isActive ? "text-green-700" : "text-gray-400"
              }`}
            >
              <item.icon size={24} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
