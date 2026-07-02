"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getLandingPath } from "@/lib/actions/session";
import { claimAdminAccount } from "@/lib/actions/admin-signup";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        if (!cancelled) setChecking(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const path = await getLandingPath();
        if (!cancelled) router.replace(path);
        return; // keep checking=true so the form never flashes before navigation
      }
      if (!cancelled) setChecking(false);
    })();
    return () => {
      cancelled = true;
    };
    // 마운트 시 1회만 실행(router는 안정적). 의도적으로 deps 비움.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const fd = new FormData();
    fd.set("email", normalizedEmail);
    fd.set("password", password);

    const result = await claimAdminAccount(null, fd);
    if (result) {
      setError(result.error);
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("서버 설정 오류입니다.");
      setLoading(false);
      return;
    }

    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInErr) {
      setError("가입은 완료됐어요. 로그인 페이지에서 로그인해 주세요.");
      setLoading(false);
      return;
    }

    router.push("/mypage");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-[var(--color-admin-muted)]">
        불러오는 중…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-admin-bg)]">
      <div className="w-full max-w-md bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-8">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">회원가입</h1>
        <p className="text-sm text-[var(--color-admin-muted)] mb-6">가입 후 기획단이 역할을 부여하면 관리자 기능을 사용할 수 있습니다. 일반 회원은 추후 게시판 등을 이용합니다.</p>
        {error && (
          <div className="mb-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="등록된 이메일"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40"
          />
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            placeholder="비밀번호 (8자 이상)"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? "가입 중..." : "가입하기"}
          </button>
        </form>
        <p className="mt-6 text-sm text-[var(--color-admin-muted)]">
          이미 계정이 있나요? <Link href="/login" className="text-[var(--color-forest)] underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
