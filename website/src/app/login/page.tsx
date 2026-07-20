"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { getLandingPath } from "@/lib/actions/session";
import AuthShell from "@/components/auth/AuthShell";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(true);
  const failCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

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

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          setLockedUntil(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      return;
    }

    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("시스템 설정 오류입니다. 관리자에게 문의하세요.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      failCount.current += 1;
      if (failCount.current >= MAX_ATTEMPTS) {
        const until = Date.now() + LOCKOUT_SECONDS * 1000;
        setLockedUntil(until);
        startCountdown(LOCKOUT_SECONDS);
        setError(`로그인 시도가 ${MAX_ATTEMPTS}회 실패했습니다. ${LOCKOUT_SECONDS}초 후 다시 시도해주세요.`);
        failCount.current = 0;
      } else {
        setError(`이메일 또는 비밀번호가 올바르지 않습니다. (${failCount.current}/${MAX_ATTEMPTS})`);
      }
      setLoading(false);
      return;
    }

    failCount.current = 0;
    const path = await getLandingPath();
    router.push(path);
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
    <AuthShell
      title="로그인"
      subtitle="로그인하여 이용하세요"
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-[var(--color-forest)] hover:underline">
            회원가입
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="email" className="text-sm font-bold text-[var(--frost-muted)]">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="frost-field outline-none focus:ring-2 focus:ring-[var(--color-forest)]/50"
            placeholder="example@email.com"
          />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label htmlFor="password" className="text-sm font-bold text-[var(--frost-muted)]">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="frost-field outline-none focus:ring-2 focus:ring-[var(--color-forest)]/50"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {error && (
          <p className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-base font-medium text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || countdown > 0}
          className="w-full rounded-full bg-[var(--color-forest)] py-4 text-lg font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:opacity-60"
        >
          {countdown > 0
            ? `${countdown}초 후 재시도`
            : loading
              ? "로그인 중..."
              : "로그인"}
        </button>
      </form>
    </AuthShell>
  );
}
