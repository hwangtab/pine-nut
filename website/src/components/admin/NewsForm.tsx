"use client";

import type { NewsItem } from "@/data/news";

const CATEGORIES = ["공지", "집회", "언론보도", "연대"] as const;

interface NewsFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: NewsItem;
  submitLabel: string;
}

export default function NewsForm({ action, initialData, submitLabel }: NewsFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div>
        <label htmlFor="title" className="block font-medium text-gray-700 mb-2">제목 *</label>
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
        <label htmlFor="slug" className="block font-medium text-gray-700 mb-2">슬러그 (URL 주소) *</label>
        <input
          id="slug"
          name="slug"
          required
          defaultValue={initialData?.slug}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          placeholder="example-news-slug (영문, 숫자, 하이픈)"
        />
        <p className="text-sm text-gray-400 mt-1">웹 주소에 표시됩니다. 영문과 하이픈(-)만 사용하세요.</p>
      </div>

      <div>
        <label htmlFor="summary" className="block font-medium text-gray-700 mb-2">요약 *</label>
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
        <label htmlFor="content" className="block font-medium text-gray-700 mb-2">본문 *</label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          defaultValue={initialData?.content}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-y"
          placeholder="소식 내용을 작성하세요. 문단 구분은 빈 줄로 합니다."
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block font-medium text-gray-700 mb-2">날짜 *</label>
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
          <label htmlFor="category" className="block font-medium text-gray-700 mb-2">카테고리 *</label>
          <select
            id="category"
            name="category"
            required
            defaultValue={initialData?.category || "언론보도"}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="source_name" className="block font-medium text-gray-700 mb-2">출처 이름</label>
          <input
            id="source_name"
            name="source_name"
            defaultValue={initialData?.sourceName}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="예: 오마이뉴스"
          />
        </div>

        <div>
          <label htmlFor="source_url" className="block font-medium text-gray-700 mb-2">출처 URL</label>
          <input
            id="source_url"
            name="source_url"
            type="url"
            defaultValue={initialData?.sourceUrl}
            className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label htmlFor="thumbnail_url" className="block font-medium text-gray-700 mb-2">썸네일 이미지 URL</label>
        <input
          id="thumbnail_url"
          name="thumbnail_url"
          type="url"
          defaultValue={initialData?.thumbnailUrl}
          className="w-full px-4 py-3.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          placeholder="https://... (이미지 주소)"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-green-700 hover:bg-green-800 rounded-xl transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
