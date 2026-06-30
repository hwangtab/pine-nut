"use client";

import { useActionState } from "react";
import {
  AdminFormError,
  AdminImageFileField,
  AdminSelectField,
  AdminSubmitButton,
  AdminTextField,
  AdminTextareaField,
} from "@/components/admin/form";
import type { NewsItem } from "@/data/news";
import type { ActionState } from "@/lib/actions/state";

const CATEGORIES = ["공지", "집회", "언론보도", "연대"] as const;

interface NewsFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: NewsItem;
  submitLabel: string;
}

export default function NewsForm({
  action,
  initialData,
  submitLabel,
}: NewsFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      <AdminFormError error={state?.error} />
      <input type="hidden" name="slug" value={initialData?.slug ?? ""} />
      <input type="hidden" name="thumbnail_url" value={initialData?.thumbnailUrl ?? ""} />

      <AdminTextField id="title" name="title" label="제목 *" required defaultValue={initialData?.title} placeholder="소식 제목을 입력하세요" variant="forest" />
      <AdminTextareaField
        id="summary"
        name="summary"
        label="요약 *"
        required
        rows={2}
        defaultValue={initialData?.summary}
        placeholder="소식을 한두 줄로 요약해주세요"
        variant="forest"
      />
      <AdminTextareaField
        id="content"
        name="content"
        label="본문 *"
        required
        rows={10}
        defaultValue={initialData?.content}
        placeholder={"소식 내용을 작성하세요.\n줄을 바꾸려면 엔터를 두 번 누르세요."}
        variant="forest"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminTextField id="date" name="date" type="date" label="날짜 *" required defaultValue={initialData?.date} variant="forest" />
        <AdminSelectField
          id="category"
          name="category"
          label="카테고리 *"
          required
          options={CATEGORIES}
          defaultValue={initialData?.category || ""}
          variant="forest"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminTextField id="source_name" name="source_name" label="어디서 나온 기사인가요?" defaultValue={initialData?.sourceName} placeholder="예: 오마이뉴스, 프레시안" variant="forest" />
        <AdminTextField
          id="source_url"
          name="source_url"
          type="url"
          label="기사 원본 주소"
          defaultValue={initialData?.sourceUrl}
          placeholder="기사의 인터넷 주소를 붙여넣으세요"
          helperText="기사 원본 주소를 입력하면 썸네일 이미지가 자동으로 설정됩니다."
          variant="forest"
        />
      </div>

      <AdminImageFileField
        label="사진 올리기 (선택)"
        variant="forest"
        helperText="사진을 올리면 기사 이미지 대신 사용됩니다. JPG, PNG, WebP (5MB 이하)"
        currentImageUrl={initialData?.thumbnailUrl}
        currentImageAlt="현재 썸네일"
        currentNotice={
          initialData?.thumbnailUrl
            ? "현재 사진이 설정되어 있습니다. 새 사진을 올리면 교체됩니다."
            : undefined
        }
      />

      <div className="pt-4">
        <AdminSubmitButton label={submitLabel} variant="forest" />
      </div>
    </form>
  );
}
