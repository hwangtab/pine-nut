"use client";

export default function LogoutButton({ className }: { className?: string }) {
  async function handleLogout() {
    // 이 버튼은 내비게이션에 늘 붙어 있어 모든 공개 페이지에 딸려 들어간다.
    // supabase-js를 정적으로 import하면 인증 클라이언트 한 벌(gzip 약 55KB)이
    // 로그인하지 않은 방문자 전원의 번들에 실린다 — 누를 때 내려받으면 된다.
    const { createSupabaseBrowserClient } = await import("@/lib/supabase-browser");
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
        "px-5 py-3 text-base font-semibold text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-bg)] transition-colors"
      }
    >
      로그아웃
    </button>
  );
}
