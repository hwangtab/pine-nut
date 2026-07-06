"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/lib/actions/state";

interface BoardPostFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: { title: string; content: string; category?: string };
  submitLabel: string;
}

function SubmitButton({ submitLabel }: { submitLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-[var(--color-forest)] px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-[var(--color-forest-light)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {pending ? "등록 중..." : submitLabel}
    </button>
  );
}

export default function BoardPostForm({
  action,
  initial,
  submitLabel,
}: BoardPostFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-xl border border-[var(--color-danger-border)] bg-[var(--color-danger-bg)] px-4 py-3 text-base font-medium text-[var(--color-danger)]">
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-base font-medium text-[var(--color-text)]"
        >
          카테고리
        </label>
        <select
          id="category"
          name="category"
          defaultValue={initial?.category ?? "자유"}
          className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-admin-surface)] px-4 py-3.5 text-base outline-none focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/40"
        >
          <option value="자유">자유</option>
          <option value="질문">질문</option>
          <option value="제안">제안</option>
          <option value="후기">후기</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-base font-medium text-[var(--color-text)]"
        >
          제목 *
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={200}
          defaultValue={initial?.title}
          placeholder="제목을 입력하세요"
          className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3.5 text-base outline-none focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/40"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-2 block text-base font-medium text-[var(--color-text)]"
        >
          내용 *
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={initial?.content}
          placeholder="내용을 입력하세요"
          className="w-full resize-y rounded-xl border border-[var(--color-border)] px-4 py-3.5 text-base outline-none focus:border-[var(--color-forest)] focus:ring-2 focus:ring-[var(--color-forest)]/40"
        />
      </div>

      <div className="pt-4">
        <SubmitButton submitLabel={submitLabel} />
      </div>
    </form>
  );
}
