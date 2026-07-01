"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { claimAdminAccount } from "@/lib/actions/admin-signup";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="w-full px-6 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50">
      {pending ? "가입 중..." : "가입하기"}
    </button>
  );
}

export default function SignupPage() {
  const [state, formAction] = useActionState(claimAdminAccount, null);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-admin-bg)]">
      <div className="w-full max-w-md bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-8">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">회원가입</h1>
        <p className="text-sm text-[var(--color-admin-muted)] mb-6">가입 후 기획단이 역할을 부여하면 관리자 기능을 사용할 수 있습니다. 일반 회원은 추후 게시판 등을 이용합니다.</p>
        {state?.error && (
          <div className="mb-4 bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base">{state.error}</div>
        )}
        <form action={formAction} className="space-y-4">
          <input name="email" type="email" required placeholder="등록된 이메일"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
          <input name="password" type="password" required minLength={8} placeholder="비밀번호 (8자 이상)"
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
          <SubmitButton />
        </form>
        <p className="mt-6 text-sm text-[var(--color-admin-muted)]">
          이미 계정이 있나요? <Link href="/login" className="text-[var(--color-forest)] underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
