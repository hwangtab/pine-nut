"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LogoutButton({ className }: { className?: string }) {
  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/";
  }
  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        "px-5 py-3 text-base font-semibold text-[var(--color-admin-muted)] border border-[var(--color-admin-border)] rounded-xl hover:bg-[var(--color-bg)] transition-colors"
      }
    >
      로그아웃
    </button>
  );
}
