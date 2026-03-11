"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { TimelineEvent } from "@/data/timeline";
import type { ActionState } from "@/lib/actions/news";

const CATEGORIES = ["회의", "집회", "법률", "연대", "기타"] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "저장 중..." : label}
    </button>
  );
}

interface TimelineFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: TimelineEvent & { sortOrder: number };
  submitLabel: string;
}

export default function TimelineForm({ action, initialData, submitLabel }: TimelineFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-base font-medium">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block font-medium text-gray-700 mb-2">제목 *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="이벤트 제목을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="description" className="block font-medium text-gray-700 mb-2">설명 *</label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={initialData?.description}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="이벤트에 대한 설명을 작성하세요"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block font-medium text-gray-700 mb-2">날짜 표시 *</label>
          <input
            id="date"
            name="date"
            required
            defaultValue={initialData?.date}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="예: 2019년 여름, 2024.03.15"
          />
          <p className="text-sm text-gray-400 mt-1">화면에 표시될 날짜 형식입니다.</p>
        </div>

        <div>
          <label htmlFor="year" className="block font-medium text-gray-700 mb-2">연도 *</label>
          <input
            id="year"
            name="year"
            type="number"
            required
            min={2000}
            max={2100}
            defaultValue={initialData?.year}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="예: 2024"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block font-medium text-gray-700 mb-2">카테고리 *</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || "기타"}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort_order" className="block font-medium text-gray-700 mb-2">정렬 순서</label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={initialData?.sortOrder ?? 0}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholder="0"
          />
          <p className="text-sm text-gray-400 mt-1">숫자가 작을수록 위에 표시됩니다.</p>
        </div>
      </div>

      <div>
        <label htmlFor="image_url" className="block font-medium text-gray-700 mb-2">이미지 URL</label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={initialData?.imageUrl}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="https://... (이미지 주소)"
        />
      </div>

      <div>
        <label htmlFor="image_alt" className="block font-medium text-gray-700 mb-2">이미지 설명</label>
        <input
          id="image_alt"
          name="image_alt"
          defaultValue={initialData?.imageAlt}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="이미지에 대한 설명 (시각장애인 접근성)"
        />
      </div>

      <div className="pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
