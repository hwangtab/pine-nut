"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setMyNickname } from "@/lib/actions/member";
import type { ActionState } from "@/lib/actions/state";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="px-5 py-2 text-sm font-semibold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-full disabled:opacity-50">{pending ? "저장 중..." : "저장"}</button>;
}

// 서버 액션은 성공 시 null을 돌려줘 초기 상태와 구분되지 않는다. 클라이언트에서 한 번
// 감싸 성공을 표시하고, 저장한 닉네임을 다시 채운다(React 19 폼 자동 리셋 대비).
type NicknameState = { error?: string; saved?: string; values?: Record<string, string> } | null;

async function saveNickname(_prev: NicknameState, formData: FormData): Promise<NicknameState> {
  const result: ActionState = await setMyNickname(null, formData);
  const nickname = ((formData.get("nickname") as string | null) ?? "").trim();
  if (result?.error) return { error: result.error, values: { nickname: (formData.get("nickname") as string | null) ?? "" } };
  return { saved: nickname };
}

export default function NicknameForm({ current }: { current: string | null }) {
  const [state, formAction] = useActionState(saveNickname, null);
  const value = state?.values?.nickname ?? state?.saved ?? current ?? "";
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input name="nickname" defaultValue={value} placeholder="닉네임(2~20자)" maxLength={20} className="paper-field flex-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]/30" />
      <SaveButton />
      <span aria-live="polite" className="text-sm">
        {state?.error && <span className="text-[var(--color-danger)]">{state.error}</span>}
        {state?.saved && <span className="text-[var(--color-forest)]">닉네임을 저장했습니다.</span>}
      </span>
    </form>
  );
}
