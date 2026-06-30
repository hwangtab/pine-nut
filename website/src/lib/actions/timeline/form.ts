import { validateOptionalImageUrl } from "@/lib/validation/url";
import type { ValidatedTimelineForm } from "@/lib/actions/timeline/types";

const TIMELINE_CATEGORIES = ["회의", "집회", "법률", "연대", "기타"];

function extractYearFromDate(dateText: string): number {
  const match = dateText.match(/(\d{4})/);
  return match ? parseInt(match[1], 10) : new Date().getFullYear();
}

export function validateTimelineForm(
  formData: FormData,
): { data: ValidatedTimelineForm | null; error: string | null } {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const date = (formData.get("date") as string)?.trim();
  const yearStr = formData.get("year") as string;
  const category = formData.get("category") as string;
  const sortOrderStr = formData.get("sort_order") as string;
  const imageAlt = (formData.get("image_alt") as string)?.trim() || null;

  if (!title) return { data: null, error: "제목을 입력해주세요." };
  if (title.length > 200) return { data: null, error: "제목은 200자 이내로 입력해주세요." };
  if (!description) return { data: null, error: "설명을 입력해주세요." };
  if (!date) return { data: null, error: "날짜를 입력해주세요." };
  if (!category || !TIMELINE_CATEGORIES.includes(category)) {
    return { data: null, error: "분류를 선택해주세요." };
  }

  const parsedYear = parseInt(yearStr, 10);
  const year = (!isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100)
    ? parsedYear
    : extractYearFromDate(date);

  const sortOrder = parseInt(sortOrderStr, 10) || 0;

  const imageUrlValidation = validateOptionalImageUrl(
    formData.get("image_url") as string,
    "사진 주소",
  );
  if (imageUrlValidation.error) return { data: null, error: imageUrlValidation.error };

  return {
    data: {
      date,
      year,
      title,
      description,
      category,
      imageUrl: imageUrlValidation.value,
      imageAlt,
      sortOrder,
    },
    error: null,
  };
}

export function friendlyTimelineError(message: string): string {
  if (message.includes("duplicate key")) {
    return "중복된 데이터가 있습니다. 내용을 확인해주세요.";
  }
  return "저장 중 오류가 발생했습니다. 다시 시도해주세요.";
}
