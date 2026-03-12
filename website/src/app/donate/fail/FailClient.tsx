"use client";

import Link from "next/link";

interface FailClientProps {
  code?: string;
  message?: string;
}

export default function FailClient({ code, message }: FailClientProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-24">
      <div className="max-w-xl mx-auto bg-white border border-[var(--color-border)] rounded-3xl p-8 sm:p-10 text-center">
        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">결제가 완료되지 않았습니다</h1>
        <p className="text-[var(--color-text-muted)] mb-4">
          결제 도중 중단되었거나 승인되지 않았습니다. 다시 시도해주세요.
        </p>
        {code || message ? (
          <div className="bg-[var(--color-bg)] rounded-2xl px-5 py-4 text-left mb-6 space-y-1">
            {code ? <p className="text-sm text-[var(--color-text-muted)]">오류 코드: {code}</p> : null}
            {message ? <p className="text-sm text-[var(--color-text-muted)]">사유: {message}</p> : null}
          </div>
        ) : null}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/donate"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[var(--color-warm)] text-white font-semibold"
          >
            후원 페이지로 돌아가기
          </Link>
          <Link
            href="/petition"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[var(--color-bg-warm)] text-[var(--color-text)] font-semibold"
          >
            함께하기로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
