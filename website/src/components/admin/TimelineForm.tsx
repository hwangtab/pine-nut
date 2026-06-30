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
import type { TimelineEvent } from "@/data/timeline";
import type { ActionState } from "@/lib/actions/state";

const CATEGORIES = ["회의", "집회", "법률", "연대", "기타"] as const;

interface TimelineFormProps {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  initialData?: TimelineEvent & { sortOrder: number };
  submitLabel: string;
}

export default function TimelineForm({
  action,
  initialData,
  submitLabel,
}: TimelineFormProps) {
  const [state, formAction] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-6">
      <AdminFormError error={state?.error} />

      <AdminTextField
        id="title"
        name="title"
        label="무슨 일이 있었나요? *"
        required
        defaultValue={initialData?.title}
        placeholder="예: 풍천리 주민 설명회 개최"
        variant="sky"
      />
      <AdminTextareaField
        id="description"
        name="description"
        label="자세한 내용 *"
        required
        rows={4}
        defaultValue={initialData?.description}
        placeholder="어떤 일이 있었는지 자세히 적어주세요"
        variant="sky"
      />
      <AdminTextField
        id="date"
        name="date"
        label="언제 있었던 일인가요? *"
        required
        defaultValue={initialData?.date}
        placeholder="예: 2024년 3월, 2019년 여름"
        helperText="화면에 그대로 표시됩니다."
        variant="sky"
      />

      <input type="hidden" name="year" value={initialData?.year ?? 0} />
      <input type="hidden" name="sort_order" value={initialData?.sortOrder ?? 0} />
      <input type="hidden" name="image_alt" value={initialData?.imageAlt ?? ""} />

      <AdminSelectField
        id="category"
        name="category"
        label="카테고리 *"
        required
        options={CATEGORIES}
        defaultValue={initialData?.category || ""}
        variant="sky"
      />
      <AdminImageFileField
        label="사진 올리기 (선택)"
        variant="sky"
        helperText="사진을 직접 올릴 수 있습니다. JPG, PNG, WebP (5MB 이하)"
        currentNotice={
          initialData?.imageUrl
            ? "현재 사진이 설정되어 있습니다. 새 사진을 올리면 교체됩니다."
            : undefined
        }
      />
      <AdminTextField
        id="image_url"
        name="image_url"
        type="url"
        label="또는 사진 주소 입력 (선택)"
        defaultValue={initialData?.imageUrl}
        placeholder="사진의 인터넷 주소를 붙여넣으세요"
        helperText="위에서 사진을 올리면 이 주소는 무시됩니다."
        variant="sky"
      />

      <div className="pt-4">
        <AdminSubmitButton label={submitLabel} variant="sky" />
      </div>
    </form>
  );
}
