"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const failCount = useRef(0);
  const router = useRouter();

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
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
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">
            풍천리 관리자
          </h1>
          <p className="text-gray-500 text-center mb-8">
            로그인하여 웹사이트를 관리하세요
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            {error && (
              <p className="text-red-600 text-base font-medium bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || countdown > 0}
              className="w-full py-4 text-lg font-bold text-white bg-green-700 hover:bg-green-800 disabled:bg-gray-400 rounded-xl transition-colors"
            >
              {countdown > 0
                ? `${countdown}초 후 재시도`
                : loading
                  ? "로그인 중..."
                  : "로그인"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
