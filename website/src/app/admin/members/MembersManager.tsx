"use client";

import { useState, useTransition } from "react";
import type { AdminMember } from "@/lib/data/admin-members";
import {
  updateAdminRoleAction,
  setAdminActiveAction,
  removeAdminMemberAction,
} from "@/lib/actions/admin-members";

const inputCls = "px-4 py-3 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40";

export default function MembersManager({ members }: { members: AdminMember[] }) {
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const signupUrl = typeof window !== "undefined" ? `${window.location.origin}/admin/signup` : "/admin/signup";
  async function copySignupUrl() {
    try {
      await navigator.clipboard.writeText(signupUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard 불가 시 무시 */
    }
  }

  function changeRole(id: number, role: string) {
    setError(null);
    startTransition(async () => {
      const r = await updateAdminRoleAction(id, role);
      if (r?.error) setError(r.error);
    });
  }
  function toggleActive(id: number, active: boolean) {
    setError(null);
    startTransition(async () => {
      const r = await setAdminActiveAction(id, active);
      if (r?.error) setError(r.error);
    });
  }
  function remove(id: number) {
    if (!confirm("이 관리자를 명부에서 삭제할까요?")) return;
    setError(null);
    startTransition(async () => {
      const r = await removeAdminMemberAction(id);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-4">
        <p className="mb-2 text-sm font-semibold text-[var(--color-admin-text)]">가입 안내</p>
        <p className="mb-3 text-sm text-[var(--color-admin-muted)]">
          이 주소를 공유하세요. 가입한 사람은 아래 목록에 &apos;대기중&apos;으로 나타나며, 역할을 지정하면 관리자가 됩니다.
        </p>
        <p className="rounded-lg bg-[var(--color-warm)]/10 px-3 py-2 text-sm text-[var(--color-warm)]">
          ⚠️ 가입 시 이메일 소유 확인 절차가 없습니다. 역할을 부여하기 전에 목록의 이메일이 실제 본인이 신청한 것인지 별도 경로(전화·메신저)로 반드시 확인하세요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-admin-text)]">{signupUrl}</code>
          <button type="button" onClick={copySignupUrl}
            className="shrink-0 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-forest-light)] transition-colors">
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-base text-[var(--color-danger)]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[var(--color-admin-text)] truncate flex items-center gap-2">
                {m.displayName ? `${m.displayName} · ` : ""}{m.email}
                {m.role === "pending" && (
                  <span className="shrink-0 rounded-full bg-[var(--color-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--color-warm)]">
                    대기중
                  </span>
                )}
              </p>
              <p className="text-sm text-[var(--color-admin-muted)]">
                {m.claimed ? "가입됨" : "미가입"} {m.active ? "" : "· 비활성"}
              </p>
            </div>
            <select value={m.role} disabled={pending} onChange={(e) => changeRole(m.id, e.target.value)}
              className={`${inputCls} bg-[var(--color-admin-surface)] sm:w-32`}>
              <option value="pending">대기(권한없음)</option>
              <option value="viewer">viewer</option>
              <option value="editor">editor</option>
              <option value="owner">owner</option>
            </select>
            <button onClick={() => toggleActive(m.id, !m.active)} disabled={pending}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-admin-border)] transition-colors">
              {m.active ? "비활성화" : "활성화"}
            </button>
            <button onClick={() => remove(m.id)} disabled={pending}
              className="px-3 py-2 text-sm font-semibold text-[var(--color-danger)] bg-[var(--color-danger-bg)] rounded-lg hover:opacity-80 transition-colors">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
