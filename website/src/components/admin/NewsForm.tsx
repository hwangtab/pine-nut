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
      className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-base font-medium">
          {state.error}
        </div>
      )}

      <input type="hidden" name="slug" value="" />
      <input type="hidden" name="thumbnail_url" value="" />

      <div>
        <label htmlFor="title" className="block font-medium text-base text-gray-800 mb-2">제목 *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          placeholder="소식 제목을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="summary" className="block font-medium text-base text-gray-800 mb-2">요약 *</label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={2}
          defaultValue={initialData?.summary}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
          placeholder="소식을 한두 줄로 요약해주세요"
        />
      </div>

      <div>
        <label htmlFor="content" className="block font-medium text-base text-gray-800 mb-2">본문 *</label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={initialData?.content}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
          placeholder={"소식 내용을 작성하세요.\n줄을 바꾸려면 엔터를 두 번 누르세요."}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block font-medium text-base text-gray-800 mb-2">날짜 *</label>
          <input
            id="date"
            name="date"
            type="date"
            required
            defaultValue={initialData?.date}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="category" className="block font-medium text-base text-gray-800 mb-2">카테고리 *</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || ""}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
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
          <label htmlFor="source_name" className="block font-medium text-base text-gray-800 mb-2">어디서 나온 기사인가요?</label>
          <input
            id="source_name"
            name="source_name"
            defaultValue={initialData?.sourceName}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="예: 오마이뉴스, 프레시안"
          />
        </div>

        <div>
          <label htmlFor="source_url" className="block font-medium text-base text-gray-800 mb-2">기사 원본 주소</label>
          <input
            id="source_url"
            name="source_url"
            type="url"
            defaultValue={initialData?.sourceUrl}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="기사의 인터넷 주소를 붙여넣으세요"
          />
          <p className="text-sm text-gray-500 mt-1.5">기사 원본 주소를 입력하면 썸네일 이미지가 자동으로 설정됩니다.</p>
        </div>
      </div>

      <div className="pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
