"use client";

import { useState, useActionState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import type { AdminMember } from "@/lib/data/admin-members";
import {
  addAdminMemberAction,
  updateAdminRoleAction,
  setAdminActiveAction,
  removeAdminMemberAction,
} from "@/lib/actions/admin-members";

const inputCls = "px-4 py-3 text-base border border-[var(--color-admin-border)] rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40";

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}
      className="px-6 py-3 bg-[var(--color-forest)] text-white font-bold rounded-xl hover:bg-[var(--color-forest-light)] transition-colors disabled:opacity-50">
      {pending ? "추가 중..." : "추가"}
    </button>
  );
}

export default function MembersManager({ members }: { members: AdminMember[] }) {
  const [state, formAction] = useActionState(addAdminMemberAction, null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
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
    startTransition(() => { updateAdminRoleAction(id, role); });
  }
  function toggleActive(id: number, active: boolean) {
    startTransition(() => { setAdminActiveAction(id, active); });
  }
  function remove(id: number) {
    if (!confirm("이 관리자를 명부에서 삭제할까요?")) return;
    startTransition(() => { removeAdminMemberAction(id); });
  }

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-[var(--color-admin-border)] bg-[var(--color-admin-surface)] p-4">
        <p className="mb-2 text-sm font-semibold text-[var(--color-admin-text)]">가입 안내</p>
        <p className="mb-3 text-sm text-[var(--color-admin-muted)]">
          아래 이메일로 관리자를 추가한 뒤, 본인에게 이 주소에서 가입하라고 안내하세요.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <code className="flex-1 truncate rounded-lg bg-[var(--color-bg)] px-3 py-2 text-sm text-[var(--color-admin-text)]">{signupUrl}</code>
          <button type="button" onClick={copySignupUrl}
            className="shrink-0 rounded-lg bg-[var(--color-forest)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-forest-light)] transition-colors">
            {copied ? "복사됨" : "링크 복사"}
          </button>
        </div>
      </div>

      <form action={formAction} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-5 space-y-3">
        <h2 className="font-bold text-[var(--color-admin-text)]">관리자 추가</h2>
        {state?.error && <p className="text-sm text-[var(--color-danger)]">{state.error}</p>}
        <div className="flex flex-col sm:flex-row gap-2">
          <input name="email" type="email" required placeholder="이메일" className={`${inputCls} flex-1`} />
          <input name="display_name" placeholder="이름(선택)" className={`${inputCls} sm:w-40`} />
          <select name="role" defaultValue="editor" className={`${inputCls} bg-[var(--color-admin-surface)]`}>
            <option value="owner">owner</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
          <AddButton />
        </div>
        <p className="text-sm text-[var(--color-admin-muted)]">추가 후 본인이 /admin/signup에서 비밀번호를 설정해 가입합니다.</p>
      </form>

      <div className="space-y-3">
        {members.map((m) => (
          <div key={m.id} className="bg-[var(--color-admin-surface)] rounded-xl border border-[var(--color-admin-border)] p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[var(--color-admin-text)] truncate">{m.displayName ? `${m.displayName} · ` : ""}{m.email}</p>
              <p className="text-sm text-[var(--color-admin-muted)]">
                {m.claimed ? "가입됨" : "미가입"} {m.active ? "" : "· 비활성"}
              </p>
            </div>
            <select value={m.role} disabled={pending} onChange={(e) => changeRole(m.id, e.target.value)}
              className={`${inputCls} bg-[var(--color-admin-surface)] sm:w-32`}>
              <option value="owner">owner</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
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
