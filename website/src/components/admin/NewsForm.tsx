"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { NewsItem } from "@/data/news";
import type { ActionState } from "@/lib/actions/news";

const CATEGORIES = ["공지", "집회", "언론보도", "연대"] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-[var(--color-forest)] hover:bg-[var(--color-forest-light)] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

interface NewsFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: NewsItem;
  submitLabel: string;
}

export default function NewsForm({ action, initialData, submitLabel }: NewsFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-[var(--color-danger-bg)] border border-[var(--color-danger-border)] text-[var(--color-danger)] px-4 py-3 rounded-xl text-base font-medium">
          {state.error}
        </div>
      )}

      <input type="hidden" name="slug" value={initialData?.slug ?? ""} />
      <input type="hidden" name="thumbnail_url" value={initialData?.thumbnailUrl ?? ""} />

      <div>
        <label htmlFor="title" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">제목 *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none"
          placeholder="소식 제목을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">요약 *</label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={2}
          defaultValue={initialData?.summary}
          className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none resize-y"
          placeholder="소식을 한두 줄로 요약해주세요"
        />
      </div>

      <div>
        <label htmlFor="content" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">본문 *</label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={initialData?.content}
          className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none resize-y"
          placeholder={"소식 내용을 작성하세요.\n줄을 바꾸려면 엔터를 두 번 누르세요."}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">날짜 *</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={initialData?.date}
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none"
          />
        </div>

        <div>
          <label htmlFor="category" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">카테고리 *</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || ""}
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none bg-[var(--color-admin-surface)]"
          >
            <option value="">-- 선택하세요 --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="source_name" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">어디서 나온 기사인가요?</label>
          <input
            id="source_name"
            name="source_name"
            defaultValue={initialData?.sourceName}
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none"
            placeholder="예: 오마이뉴스, 프레시안"
          />
        </div>

        <div>
          <label htmlFor="source_url" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">기사 원본 주소</label>
          <input
            id="source_url"
            name="source_url"
            type="url"
            defaultValue={initialData?.sourceUrl}
            className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl focus:ring-2 focus:ring-[var(--color-forest)]/40 focus:border-[var(--color-forest)] outline-none"
            placeholder="기사의 인터넷 주소를 붙여넣으세요"
          />
          <p className="text-sm text-[var(--color-admin-muted)] mt-1.5">기사 원본 주소를 입력하면 썸네일 이미지가 자동으로 설정됩니다.</p>
        </div>
      </div>

      <div>
        <label htmlFor="image_file" className="block font-medium text-base text-[var(--color-admin-text)] mb-2">
          사진 올리기 (선택)
        </label>
        {initialData?.thumbnailUrl && (
          <p className="text-sm text-[var(--color-forest)] mb-2">현재 사진이 설정되어 있습니다. 새 사진을 올리면 교체됩니다.</p>
        )}
        <input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full px-4 py-3.5 text-base border border-[var(--color-admin-border)] rounded-xl
                     file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0
                     file:text-base file:font-medium file:bg-[var(--color-forest)]/10 file:text-[var(--color-forest)]
                     hover:file:bg-[var(--color-forest)]/20 file:cursor-pointer"
        />
        <p className="text-sm text-[var(--color-admin-muted)] mt-1.5">
          사진을 올리면 기사 이미지 대신 사용됩니다. JPG, PNG, WebP (5MB 이하)
        </p>
      </div>

      <div className="pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
