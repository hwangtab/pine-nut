"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { setMyNickname } from "@/lib/actions/member";

function SaveButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="px-4 py-2 text-sm font-semibold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-lg disabled:opacity-50">{pending ? "저장 중..." : "저장"}</button>;
}

export default function NicknameForm({ current }: { current: string | null }) {
  const [state, formAction] = useActionState(setMyNickname, null);
  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input name="nickname" defaultValue={current ?? ""} placeholder="닉네임(2~20자)" className="px-3 py-2 text-base border border-[var(--color-admin-border)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--color-forest)]/40" />
      <SaveButton />
      {state?.error && <span className="text-sm text-[var(--color-danger)]">{state.error}</span>}
    </form>
  );
}
