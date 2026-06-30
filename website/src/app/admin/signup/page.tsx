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

export default function AdminSignupPage() {
  const [state, formAction] = useActionState(claimAdminAccount, null);
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-admin-bg)]">
      <div className="w-full max-w-md bg-[var(--color-admin-surface)] rounded-2xl border border-[var(--color-admin-border)] p-8">
        <h1 className="text-2xl font-bold text-[var(--color-admin-text)] mb-2">관리자 가입</h1>
        <p className="text-sm text-[var(--color-admin-muted)] mb-6">owner가 등록한 이메일로만 가입할 수 있습니다.</p>
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
          가입 후 <Link href="/admin/login" className="text-[var(--color-forest)] underline">로그인</Link>하세요.
        </p>
      </div>
    </div>
  );
}
