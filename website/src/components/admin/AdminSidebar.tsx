"use client";

import { useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Newspaper,
  Clock,
  Users,
  LogOut,
  Blocks,
  Images,
  History,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/admin", label: "홈", icon: Home },
  { href: "/admin/site-builder", label: "사이트 빌더", icon: Blocks },
  { href: "/admin/media", label: "미디어", icon: Images },
  { href: "/admin/history", label: "히스토리", icon: History },
  { href: "/admin/news", label: "소식 관리", icon: Newspaper },
  { href: "/admin/timeline", label: "타임라인 관리", icon: Clock },
  { href: "/admin/signatures", label: "서명 현황", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const handleLogout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/admin/login";
  }, []);

  // onAuthStateChange로 세션 만료 즉시 감지
  useEffect(() => {
    if (isLoginPage) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/admin/login";
      }
    });

    return () => subscription.unsubscribe();
  }, [isLoginPage]);

  if (isLoginPage) return null;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--color-admin-surface)] border-r border-[var(--color-admin-border)] min-h-screen p-6">
        <div className="mb-8">
          <Link href="/admin" className="text-xl font-bold text-[var(--color-admin-text)]">
            풍천리 관리자
          </Link>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-admin-muted)]">
            인라인 편집, 사이트 빌더, 히스토리 복원을 한곳에서 관리합니다.
          </p>
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
                className={`min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
                    : "text-[var(--color-admin-muted)] hover:bg-[var(--color-bg)]"
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
          className="min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-[var(--color-admin-muted)] hover:bg-[var(--color-bg)] transition-colors mt-4"
        >
          <LogOut size={22} />
          로그아웃
        </button>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-admin-border)] bg-[var(--color-admin-surface)]">
        <div className="flex overflow-x-auto px-2 py-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-w-[88px] min-h-[44px] flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-forest)]/10 text-[var(--color-forest)]"
                    : "text-[var(--color-admin-muted)]/70"
                }`}
              >
                <item.icon size={24} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="min-w-[88px] min-h-[44px] flex shrink-0 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-3 text-xs font-medium text-[var(--color-admin-muted)]/70 transition-colors"
          >
            <LogOut size={24} />
            로그아웃
          </button>
        </div>
      </nav>
    </>
  );
}
