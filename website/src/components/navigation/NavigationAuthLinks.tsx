"use client";

import { useCallback } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

interface NavigationAuthLinksProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  variant?: "desktop" | "mobile";
}

export default function NavigationAuthLinks({
  isAdmin,
  isLoggedIn,
  variant = "desktop",
}: NavigationAuthLinksProps) {
  const handleLogout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/";
  }, []);

  const isMobile = variant === "mobile";

  const linkClassName = isMobile
    ? "px-4 py-3 rounded-xl text-lg font-medium min-h-[48px] flex items-center transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
    : "px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]";

  const signupClassName = isMobile
    ? "px-4 py-3 rounded-xl text-lg font-bold min-h-[48px] flex items-center justify-center transition-colors text-white bg-[var(--color-forest)] hover:opacity-90"
    : "px-4 py-2 rounded-lg text-[15px] font-bold min-h-[44px] flex items-center transition-colors text-white bg-[var(--color-forest)] hover:opacity-90";

  const buttonClassName = isMobile
    ? "px-4 py-3 rounded-xl text-lg font-medium min-h-[48px] flex items-center transition-colors text-left text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
    : "px-4 py-2 rounded-lg text-[15px] font-medium min-h-[44px] flex items-center transition-colors duration-300 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]";

  const containerClassName = isMobile
    ? "flex flex-col gap-1 mt-3 pt-3 border-t border-[var(--color-border)]"
    : "flex items-center gap-1 ml-3 pl-3 border-l border-[var(--color-border)]";

  if (!isLoggedIn) {
    return (
      <div className={containerClassName}>
        <Link href="/login" className={linkClassName}>
          로그인
        </Link>
        <Link href="/signup" className={signupClassName}>
          회원가입
        </Link>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {isAdmin && (
        <Link href="/admin" className={linkClassName}>
          관리자
        </Link>
      )}
      <button type="button" onClick={handleLogout} className={buttonClassName}>
        로그아웃
      </button>
    </div>
  );
}
