"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 공개 라우트의 오류 경계.
 *
 * 이 사이트는 프로덕션에서 Supabase 접근이 실패하면 의도적으로 throw한다(fail-closed).
 * 받아줄 error.tsx가 없으면 브랜딩 없는 Next 기본 오류 화면이 떠서, 방문자는
 * 무슨 일인지도 어디로 가야 할지도 알 수 없다. 서명·후원 같은 핵심 경로를 남겨둔다.
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("public error boundary:", error);
  }, [error]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-[var(--color-warm)] mb-3">
          일시적인 오류
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text)] mb-4">
          페이지를 불러오지 못했습니다
        </h1>
        <p className="text-base text-[var(--color-text-muted)] leading-relaxed mb-8">
          잠시 후 다시 시도해주세요. 문제가 계속되면 알려주시면 빠르게 확인하겠습니다.
          {error.digest && (
            <>
              <br />
              <span className="text-sm font-mono">오류 번호: {error.digest}</span>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="min-h-[48px] px-6 py-3 rounded-full bg-[var(--color-warm)] hover:bg-[var(--color-warm-light)] text-white font-bold transition-colors"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="min-h-[48px] inline-flex items-center px-6 py-3 rounded-full border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-bg)] transition-colors"
          >
            홈으로
          </Link>
          <Link
            href="/petition"
            className="min-h-[48px] inline-flex items-center px-6 py-3 rounded-full border border-[var(--color-border)] text-[var(--color-text)] font-semibold hover:bg-[var(--color-bg)] transition-colors"
          >
            서명 참여
          </Link>
        </div>
      </div>
    </main>
  );
}
