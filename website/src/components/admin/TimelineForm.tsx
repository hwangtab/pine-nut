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
        <label htmlFor="title" className="block font-medium text-base text-gray-800 mb-2">무슨 일이 있었나요? *</label>
        <input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="예: 풍천리 주민 설명회 개최"
        />
      </div>

      <div>
        <label htmlFor="description" className="block font-medium text-base text-gray-800 mb-2">자세한 내용 *</label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={initialData?.description}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          placeholder="어떤 일이 있었는지 자세히 적어주세요"
        />
      </div>

      <div>
        <label htmlFor="date" className="block font-medium text-base text-gray-800 mb-2">언제 있었던 일인가요? *</label>
        <input
          id="date"
          name="date"
          required
          defaultValue={initialData?.date}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="예: 2024년 3월, 2019년 여름"
        />
        <p className="text-sm text-gray-500 mt-1.5">화면에 그대로 표시됩니다.</p>
      </div>

      {/* year: server will extract from date text */}
      <input type="hidden" name="year" value="0" />

      {/* sort_order: server will auto-assign for new items */}
      <input type="hidden" name="sort_order" value={initialData?.sortOrder ?? 0} />

      {/* image_alt: hidden empty value */}
      <input type="hidden" name="image_alt" value={initialData?.imageAlt ?? ""} />

      <div>
        <label htmlFor="category" className="block font-medium text-base text-gray-800 mb-2">카테고리 *</label>
        <select
          id="category"
          name="category"
          required
          defaultValue={initialData?.category || ""}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
        >
          <option value="">-- 선택하세요 --</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image_file" className="block font-medium text-base text-gray-800 mb-2">
          사진 올리기 (선택)
        </label>
        <input
          id="image_file"
          name="image_file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl
                     file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0
                     file:text-base file:font-medium file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100 file:cursor-pointer"
        />
        <p className="text-sm text-gray-500 mt-1.5">
          사진을 직접 올릴 수 있습니다. JPG, PNG, WebP (5MB 이하)
        </p>
      </div>

      <div>
        <label htmlFor="image_url" className="block font-medium text-base text-gray-800 mb-2">또는 사진 주소 입력 (선택)</label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          defaultValue={initialData?.imageUrl}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="사진의 인터넷 주소를 붙여넣으세요"
        />
      </div>

      <div className="pt-4">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
