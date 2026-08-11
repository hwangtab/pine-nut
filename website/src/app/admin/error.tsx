"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 관리자 영역의 서버/클라이언트 예외를 받아 복구 가능한 화면으로 바꾼다.
 * 없으면 기본 500 화면이 떠서, 관리자는 무슨 일이 났는지도 어디로 가야 하는지도 알 수 없다.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin error boundary:", error);
  }, [error]);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto">
      <div className="rounded-2xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-8">
        <h1 className="text-xl font-bold text-[var(--color-admin-text)] mb-3">
          화면을 불러오지 못했습니다
        </h1>
        <p className="text-base text-[var(--color-admin-muted)] mb-2">
          일시적인 오류일 수 있습니다. 다시 시도해보시고, 계속 같은 화면이 나오면
          아래 오류 번호와 함께 알려주세요.
        </p>
        {error.digest && (
          <p className="text-sm font-mono text-[var(--color-admin-muted)] mb-6">
            오류 번호: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={reset}
            className="px-6 py-3 bg-[var(--color-forest)] text-white font-bold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors text-base"
          >
            다시 시도
          </button>
          <Link
            href="/admin"
            className="px-6 py-3 text-base font-semibold text-[var(--color-admin-muted)] bg-[var(--color-bg)] rounded-xl hover:opacity-80 transition-opacity"
          >
            관리자 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
